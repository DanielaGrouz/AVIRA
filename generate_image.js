const { HfInference } = require('@huggingface/inference');
require('dotenv').config();
const fs = require('fs');
const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Recommended Prompt Structure for FLUX:
 * [Subject] + [Action/Text] + [Environment] + [Lighting/Style]
 */
async function generateEventInvite(eventData) {
    // Constructing a "High-End" prompt based on your event fields
    const prompt = `A professional graphic design for an event invitation. 
    The center features the text "${eventData.title}" in elegant modern typography. 
    The background is ${eventData.location} with a ${eventData.vibe} atmosphere. 
    Minimalist aesthetic, clean lines, high-quality editorial layout, 
    soft ambient lighting, 4k resolution, graphic design style.`;

    try {
        const blob = await hf.textToImage({
            model: 'black-forest-labs/FLUX.1-schnell',
            inputs: prompt,
            parameters: {
                guidance_scale: 3.5,
                num_inference_steps: 4, // Required for 'schnell' models
                width: 1024,
                height: 1024,
            },
        });

        // Convert Blob to buffer for saving or sending
        return Buffer.from(await blob.arrayBuffer());
    } catch (error) {
        console.error("HF Error:", error.message);
        return null;
    }
}

// Example Usage
// const event = {
//     title: "AVIRA Project Launch",
//     location: "a sleek rooftop lounge in Tel Aviv at sunset",
//     vibe: "sophisticated and celebratory"
// };

// generateEventInvite(event).then(buffer => {
//     if(buffer) require('fs').writeFileSync('invite.png', buffer);
// });
