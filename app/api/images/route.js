import Replicate from 'replicate';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    console.log('Received prompt:', prompt);

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('Attempting to generate image...');
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: `A cover photo for a roleplaying campaign set in Dungeons & Dragons 5th Edition. In the style of 80s fantasy book cover. DO NOT INCLUDE ANY TEXT IN THE IMAGE. The campaign summary is: ${prompt}`,
        }
      }
    );

    console.log('Raw output from Replicate:', output);
    
    if (!output || !output[0]) {
      throw new Error('No image data received from Replicate');
    }

    // Get the stream from the output
    const stream = output[0];
    
    // Convert stream to buffer
    const chunks = [];
    const reader = stream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Convert buffer to base64
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log('Generated data URL successfully');

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