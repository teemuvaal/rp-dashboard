import Replicate from 'replicate';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, type = 'campaign', artStyle = '90s fantasy book' } = await request.json();
    console.log(`Received ${type} image generation request with prompt:`, prompt);

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log(`Attempting to generate ${type} image...`);
    
    // Configure input parameters based on image type
    let inputConfig = {};
    
    if (type === 'highlight') {
      // Configuration for visual summary highlight images
      inputConfig = {
        aspect_ratio: "16:9",
        guidance: 3,
        interval: 2,
/*         output_format: "webp", */
        output_quality: 80,
        prompt: `In the style of ${artStyle} fitting to highlight a key event in a role playing campaign. ${prompt}`,
        prompt_upsampling: false,
        safety_tolerance: 2,
        steps: 25
      };
    } else {
      // Default configuration for campaign images
      inputConfig = {
        aspect_ratio: "16:9",
        guidance: 3,
        steps: 25,
        megapixels: "1",
        prompt: `A large cover photo for a roleplaying campaign. In the style of ${artStyle}. The campaign summary is: ${prompt}`,
      };
    }

    console.log('Using configuration:', inputConfig);
    
    const output = await replicate.run(
      "black-forest-labs/flux-pro",
      {
        input: inputConfig
      }
    );

    console.log('Raw output from Replicate:', output);
    
    // The response from Replicate for this model is a URL string directly, not a stream
    if (!output) {
      throw new Error('No output received from Replicate');
    }
    
    // For Flux model, the output is directly a URL to an image
    const imageUrl = output;
    console.log(`Generated image URL: ${imageUrl}`);
    
    // Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from Replicate URL: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Get the image as arrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Convert buffer to base64
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log(`Generated ${type} image successfully`);

    // Return the data URL
    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error('Image generation error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { error: `Failed to generate image: ${error.message}` },
      { status: 500 }
    );
  }
}