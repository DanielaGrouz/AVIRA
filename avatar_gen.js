const { HfInference } = require('@huggingface/inference');
require('dotenv').config();
const fs = require('fs');
const hf = new HfInference(process.env.HF_TOKEN);

/**
 * Recommended Prompt Structure for FLUX Avatars:
 * [Subject/Role] + [Key Traits] + [Aesthetic/Vibe] + [Lighting/Background]
 */
async function generateAvatar(userData) {
    // Adapted prompt focusing on clean lines and a modern digital look
    const prompt = `A professional 3D profile picture avatar of a ${userData.role}. 
    The character features ${userData.traits}. 
    Minimalist and clean aesthetic, smooth 3D digital art style, clean lines. 
    The background is a soft, solid ${userData.colorTheme} color. 
    Soft ambient studio lighting, perfectly centered, high-quality rendering.`;

    try {
        console.log(`Generating avatar for: ${userData.role}...`);
        const blob = await hf.textToImage({
            model: 'black-forest-labs/FLUX.1-schnell',
            inputs: prompt,
            parameters: {
                guidance_scale: 3.5,
                num_inference_steps: 4, // Keep at 4 for 'schnell'
                width: 96,  // Smaller size is better for avatars and faster to generate
                height: 96,
            },
        });

        return Buffer.from(await blob.arrayBuffer());
    } catch (error) {
        console.error("HF Error:", error.message);
        return null;
    }
}

// Example Usage
const userProfile = {
    role: "cat",
    traits: "grey hair and green eyes, looking friendly but a little aggressive",
    colorTheme: "pastel blue"
};

generateAvatar(userProfile).then(buffer => {
    if(buffer) {
        fs.writeFileSync('avatar.png', buffer);
        console.log("Success! Avatar saved as avatar.png");
    }
});


// const obj = {
//     event_id: "fjhf",
//     phones: "054545454"
// }
//
// `${FRONT_URL}/event/approve?event_id=${obj.event_id}&phone=${obj.phones}`
