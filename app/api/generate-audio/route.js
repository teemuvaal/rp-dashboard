import { ElevenLabsClient } from "elevenlabs";
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

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

        // Get the stream response
        const audioStream = await client.textToSpeech.convert(voiceId, {
            text,
            model_id: modelId,
            output_format: outputFormat
        });

        // Convert stream to buffer
        const chunks = [];
        const readable = Readable.from(audioStream);
        
        for await (const chunk of readable) {
            chunks.push(chunk);
        }
        
        const buffer = Buffer.concat(chunks);
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