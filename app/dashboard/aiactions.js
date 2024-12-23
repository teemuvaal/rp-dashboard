import { generateText } from 'ai';

const { text } = await generateText({
  model: yourModel,
  system:
    'You are professional assistant for running a roleplaying campaign set in Dungeons & Dragons 5th Edition.' +
    'You write content for the campaign in a way that is engaging and interesting for the players.' +
    'You support the DM in running the campaign by providing helpful information and suggestions.' +
    'You help players in the campaign by improving their notes and providing helpful information.',
  prompt: `Format this following note properly, use simple HTML: ${note}`,
});