const { HfInference } = require('@huggingface/inference');
const configClient = require('./configClient');
const hf = new HfInference(configClient.getConfig('HF_TOKEN'));

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
        num_inference_steps: 4,
        width: 512,
        height: 512,
      },
    });

    return Buffer.from(await blob.arrayBuffer());
  } catch (error) {
    console.error('HF Error:', error.message);
    throw error;
  }
}

exports.generateAvatar = generateAvatar;
