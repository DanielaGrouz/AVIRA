const { HfInference } = require('@huggingface/inference');
const configClient = require('./configClient');
const hf = new HfInference(configClient.getConfig('HF_TOKEN'));

async function generateEventInvite(eventData) {
  const prompt = `A professional graphic design for an event invitation. 
    The center features the text "${eventData.title}" and the datetime: "${eventData.date} ${eventData.time}" in elegant modern typography. 
    The background is ${eventData.location} with a ${eventData.eventType} atmosphere. 
    Minimalist aesthetic, clean lines, high-quality editorial layout, 
    soft ambient lighting, 4k resolution, graphic design style.`;
  console.log(prompt);
  try {
    const blob = await hf.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: prompt,
      parameters: {
        guidance_scale: 3.5,
        num_inference_steps: 4,
        width: 1024,
        height: 1024,
      },
    });

    return Buffer.from(await blob.arrayBuffer());
  } catch (error) {
    console.error('HF Error:', error.message);
    throw error;
  }
}
exports.generateEventInvite = generateEventInvite;
