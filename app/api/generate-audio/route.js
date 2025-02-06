import { ElevenLabsClient } from "elevenlabs";
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { text, modelId, voiceId, outputFormat } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        const client = new ElevenLabsClient({
            apiKey: process.env.ELEVEN_LABS_API_KEY
        });

        // Get the audio response as a stream
        const audioStream = await client.textToSpeech.convert(voiceId, {
            text,
            model_id: modelId,
            output_format: outputFormat
        });

        // Read the stream into chunks
        const chunks = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }

        // Concatenate all chunks into a single buffer
        const buffer = Buffer.concat(chunks);
        
        // Convert to base64
        const base64Audio = buffer.toString('base64');
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

        return NextResponse.json({ audioUrl });
    } catch (error) {
        console.error('Error generating audio:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate audio' },
            { status: 500 }
        );
    }
} 