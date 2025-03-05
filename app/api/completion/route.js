import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
    try {
        const { prompt } = await req.json();

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful tabletop roleplaying campaign assistant that provides clear, concise responses. When asked to format responses as JSON, ensure the output is valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        return NextResponse.json({ text: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error in completion route:', error);
        return NextResponse.json({ error: 'Failed to generate completion' }, { status: 500 });
    }
}