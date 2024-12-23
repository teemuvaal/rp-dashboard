import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST() {
  const { prompt } = await req.json();

  const { text } = await generateText({
    model: openai('gpt-4'),
    system:
    'You are professional assistant for running a roleplaying campaign set in Dungeons & Dragons 5th Edition.' +
    'You write content for the campaign in a way that is engaging and interesting for the players.' +
    'You support the DM in running the campaign by providing helpful information and suggestions.' +
    'You help players in the campaign by improving their notes and providing helpful information.',
    prompt,
  });

  return Response.json({ text });
}