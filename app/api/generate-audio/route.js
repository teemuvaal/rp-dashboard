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

        // Get the audio as ArrayBuffer
        const audioResponse = await client.textToSpeech.convert(voiceId, {
            text,
            model_id: modelId,
            output_format: outputFormat
        });

        // Convert ArrayBuffer to Buffer
        const buffer = Buffer.from(await audioResponse.arrayBuffer());
        
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