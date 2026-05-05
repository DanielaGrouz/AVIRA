const configClient = require("./models/configClient")
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


// async function main(){
//     // Example for AVIRA
//     // fetch event metadata from db
//
//     const inviteText = await getHumanInvite({
//         title: "the AVIRA project launch drinks",
//         location: "the tech hub rooftop",
//         date: "September 12th",
//         vibe: "relaxed but proud"
//     });
//
//     console.log(inviteText);
// }
// main();
