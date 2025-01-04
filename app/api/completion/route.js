import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const { text } = await generateText({
      model: openai('gpt-4'),
      system:
        'You are professional assistant for running a roleplaying campaign set in Dungeons & Dragons 5th Edition.' +
        'You write content for the campaign in a way that is engaging and interesting for the players.' +
        'You support the DM in running the campaign by providing helpful information and suggestions.' +
        'You help players in the campaign by improving their notes and providing helpful information.',
      prompt,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Completion error:', error);
    return NextResponse.json(
      { error: 'Failed to process completion request' },
      { status: 500 }
    );
  }
}