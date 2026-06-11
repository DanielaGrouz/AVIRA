const configClient = require("./configClient");
const axios = require("axios");
const Groq= require("groq-sdk")

const groq = new Groq({ apiKey: configClient.getConfig("GROQ_API_KEY")});

async function getHumanInvite(event) {
    const chatCompletion = await groq.chat.completions.create({
        "messages": [
            {
                // who are you as groq
                "role": "system",
                "content": "You are a friendly person writing a text message or casual email. NEVER use bullet points, formal headers (like 'Subject:'), or generic placeholders. Write in a natural, conversational flow."
            },
            {
                // the prompt
                "role": "user",
                "content": `Hey, can you write an invite for ${event.title}? It's at ${event.location} on ${event.date}. Make it feel ${event.vibe}.`
            }
        ],
        "model": "llama-3.1-8b-instant", // Best for free tier stability
        "temperature": 0.85, // Higher temp = more "human" variance
    });

    return chatCompletion.choices[0].message.content;
}


async function getSupermarketList(event) {
    const { title, date, time, location, eventType, guestsCount } = event;

    const chatCompletion = await groq.chat.completions.create({
        "messages": [
            {
                "role": "system",
                "content": `You are a precision logistics assistant for events. 
                Return a JSON object containing a "shopping_list" array. 
                
                Rules for items:
                1. BE SPECIFIC: Never use broad terms like "Fresh fruits" or "Snacks". Instead, list "Strawberries", "Blueberries", "Salted Pretzels", etc.
                2. SCHEMA: Each element must have:
                   - "item": Specific product name.
                   - "quantity": The numeric value.
                   - "unit": The measurement unit (e.g., "kg", "ml", "grams", "bottles", "packs").
                
                Base quantities logically on ${guestsCount} guests for a ${eventType}. 
                Only return valid JSON.`
            },
            {
                "role": "user",
                "content": `Event: ${title}
                Guests: ${guestsCount}
                Location: ${location}
                Event Type: ${eventType}
                Timing: ${date} at ${time}`
            }
        ],
        "model": "llama-3.3-70b-versatile",
        "response_format": { "type": "json_object" },
        "temperature": 0.3
    });

    try {
        const response = JSON.parse(chatCompletion.choices[0].message.content);
        return response.shopping_list;
    } catch (error) {
        console.error("Error parsing Groq response:", error);
        return [];
    }
}

async function getEventTaskList(event) {
    const { title, date, time, eventType, guestsCount } = event;

    const chatCompletion = await groq.chat.completions.create({
        "messages": [
            {
                "role": "system",
                "content": `You are a high-end event manager. Return a JSON object containing a "task_list" array.
                
                Rules for tasks:
                1. NO CATEGORIES: Just provide specific, actionable tasks.
                2. HYPER-SPECIFIC: Instead of "Order food," use tasks like "Call catering to finalize finger food menu" or "Place order for 15 pizzas."
                3. SCHEMA: Each element must have:
                   - "task": The highly specific action.
                   - "daysBefore": Numeric value representing how many days before the event this should be completed.
                
                Base the logic on a ${eventType} for ${guestsCount} people. 
                Only return valid JSON.`
            },
            {
                "role": "user",
                "content": `Event: ${title}
                Date: ${date}
                Time: ${time}`
            }
        ],
        "model": "llama-3.3-70b-versatile",
        "response_format": { "type": "json_object" },
        "temperature": 0.4
    });

    try {
        const response = JSON.parse(chatCompletion.choices[0].message.content);
        return response.task_list;
    } catch (error) {
        console.error("Error parsing task list:", error);
        return [];
    }
}


// Helper to safely parse JSON from LLM responses
const parseLLMJSON = (str) => {
    if (!str) return [];
    const cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
};

async function getStoresForEvent(currLocation, tasksList) {
    const { lat, lon } = currLocation;
    const radius = 2500; // 2.5km

    try {
        console.log(`--- Starting Store Search for ${tasksList.length} tasks ---`);

        const extractionPrompt = `
      You are an event management routing assistant.
      Given this list of tasks: ${JSON.stringify(tasksList)}
      Identify the types of physical stores needed.
      Return ONLY a raw JSON array of strings.
      CRITICAL: You must ONLY use valid standard OpenStreetMap values for the "shop" key (e.g., "bakery", "supermarket", "florist", "party", "alcohol", "butcher", "convenience", "clothes", "gift").
      Do not include any extra text.
    `;

        const groqResponse1 = await groq.chat.completions.create({
            messages: [{ role: 'user', content: extractionPrompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
        });

        const storeTypes = parseLLMJSON(groqResponse1.choices[0]?.message?.content);
        console.log("1. LLM Extracted Store Types:", storeTypes);

        if (!storeTypes || storeTypes.length === 0) {
            console.log("Stop: LLM returned no store types.");
            throw new Error("We couldn't identify the types of stores needed for your tasks.");
        }

        let overpassQuery = `[out:json][timeout:25];\n(\n`;
        storeTypes.forEach(type => {
            overpassQuery += `  nwr["shop"="${type}"](around:${radius},${lat},${lon});\n`;
            overpassQuery += `  nwr["amenity"="${type}"](around:${radius},${lat},${lon});\n`;
        });
        overpassQuery += `);\nout center;`;

        const overpassEndpoints = [
            'https://overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
            'https://overpass.openstreetmap.fr/api/interpreter'
        ];

        let osmResponse = null;
        let serverSuccess = false;

        for (const url of overpassEndpoints) {
            try {
                osmResponse = await axios.post(
                    url,
                    `data=${encodeURIComponent(overpassQuery)}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json',
                            'User-Agent': 'Event-Management-Backend/1.0'
                        },
                        timeout: 25000
                    }
                );

                serverSuccess = true;
                break;
            } catch (error) {
                console.warn(`Server ${url} failed...`);
            }
        }

        if (!serverSuccess || !osmResponse) {
            console.error("All Overpass servers failed.");
            throw new Error("Map services are temporarily unavailable. Please try again later.");
        }

        const rawElementsCount = osmResponse.data.elements?.length || 0;
        console.log(`2. Overpass API found ${rawElementsCount} raw elements.`);

        // Clean up the OSM data (Improved name checking)
        const candidatePlaces = osmResponse.data.elements
            .filter(el => el.tags && (el.tags.name || el.tags['name:he'] || el.tags['name:en']))
            .map(el => ({
                name: el.tags.name || el.tags['name:he'] || el.tags['name:en'] || 'Unnamed Store',
                category: el.tags.shop || el.tags.amenity,
                lat: el.lat || el.center?.lat,
                lon: el.lon || el.center?.lon,
                address: el.tags['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}`.trim() : 'Address not listed'
            }));

        console.log(`3. Filtered Candidate Places (with names): ${candidatePlaces.length}`);

        if (candidatePlaces.length === 0) {
            console.log("Stop: No candidate places found in the radius with names.");
            throw new Error("No relevant stores were found within a 2.5km radius of your location.");
        }

        const filteringPrompt = `
      Event tasks: ${JSON.stringify(tasksList)}
      Nearby stores found: ${JSON.stringify(candidatePlaces)}
      
      Map the best available stores to the specific tasks. Filter out irrelevant stores.
      Return ONLY a raw JSON array of objects with this format: 
      [{"task": "Buy a 3-tier cake", "storeName": "Sweet Treats Bakery","lat": "...", "lon":"..." ,"address": "...", "reason": "Matches the bakery requirement"}]
      If no stores match a task, do not include that task.
    `;

        const groqResponse2 = await groq.chat.completions.create({
            messages: [{ role: 'user', content: filteringPrompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
        });

        const finalMapping = parseLLMJSON(groqResponse2.choices[0]?.message?.content);
        console.log(`4. Final mapped tasks to stores: ${finalMapping ? finalMapping.length : 0}`);

        if (!finalMapping || finalMapping.length === 0) {
            throw new Error("Stores were found nearby, but none matched your specific event tasks.");
        }

        return finalMapping;

    } catch (error) {
        console.error("Failed to fetch event stores:", error.message);
        throw error;
    }
}

module.exports = { getHumanInvite, getSupermarketList, getEventTaskList, getStoresForEvent };