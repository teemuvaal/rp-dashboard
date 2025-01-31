import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful assistant to managing a D&D campaign. Provide helpful information and suggestions to the user.`+
    `You are to help with the following: creating characters, creating locations, creating sessions`+
    `Provide clear actionable steps to the user. If you are unable to help with the user's request, say so. Do not make up information.`+
    messages,
  });

  return result.toDataStreamResponse();
}