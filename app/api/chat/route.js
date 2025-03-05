import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'system',
        content: `You are a enthusiastic and helpful assistant to managing a tabletop roleplaying campaign in Dungeons and Dragons 5th edition. Provide helpful information and suggestions to the user.
        You are to help with any tasks related to planning, executing and managing the campaign.
        Provide clear actionable steps to the user. If you are unable to help with the user's request, say so and request additional details. Do not make up information.
        User can extract your replies directly as notes and assets, so consider the format of your response in cases where you are directly asked to generate something.
        `
      },
      ...messages
    ],
  });

  return result.toDataStreamResponse();
}