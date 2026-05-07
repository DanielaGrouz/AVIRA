const configClient = require("./configClient")
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



module.exports = { getHumanInvite, getSupermarketList, getEventTaskList };