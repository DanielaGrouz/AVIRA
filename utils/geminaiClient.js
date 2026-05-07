const { GoogleGenerativeAI } = require("@google/generative-ai");
const configClient = require("./configClient")

const genAI = new GoogleGenerativeAI(configClient.getConfig('GOOGLE_API_KEY'));

async function getStoresForEvent(todoList, lat, lon) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [{ googleSearchRetrieval: {} }]
    });

    const prompt = `Location: ${lat}, ${lon}. Todo List: ${todoList.join(", ")}. 
    Find specific stores nearby to buy these items. Return a JSON list of store names and addresses.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}
exports.getStoresForEvent = getStoresForEvent;