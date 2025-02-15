# Adventure Hub

Adventure Hub is a web app for DMs and players to create and share their adventures.

Built with:

- Next.js 14
- Supabase (auth, db, storage)
- TailwindCSS (styling)
- AI SDK
- Shadcn UI (components)
- OpenAI (AI text)
- Replicate (AI image)
- ElevenLabs (AI voice)
- Resend (email)
- PostHog (analytics)

## Notes

This is about building a functioning product with a focus on AI tools and realtime collaboration. Migration to Next.js 15 / React 19 is currently difficult due to the use of Supabase Auth Helpers, but hopefully soon ok.

App has basic support for subscriptions and tiers of subscriptions to control access to features. Before launch, need to implement proper access control to features based on owner and subscription tier.
First version of visual summary is complete, but needs to be cleaned up and optimized.

Need to do proper provider for user to avoid refetching user id on some pages.

## Tech Stack

- Next.js
- Supabase (auth, db, storage)
- TailwindCSS (styling)
- Shadcn UI (components)
- Resend (email)
- OpenAI (AI text)
- Replicate (AI image)
- ElevenLabs (AI voice)
- Upstash (rate limiting)

## Features

- Login with Discord, Google or Email
- Campaign Management (Sessions, Notes, Assets, etc.)
- Craft campaign details: characters, locations, items, etc.
- AI enhanced Session Summaries (OpenAI, Replicate and Elevenlabs)
- Polls to vote for session times or details
- Archive past adventures

## To Do

Below is a list of features that are complete or in progress and should be completed to launch.

- [x] Create Campaign
  - [x] Campaign Setting
  - [x] Campaign Image
    - [x] AI Generate
  - [x] Campaign Members Management
    - [x] Invite Members
    - [x] Remove Members
- [x] Create Session
  - [x] Session summary
  - [x] Session recap
  - [x] Session highlights
- [x] Create Note
  - [x] Show active participants
  - [ ] Collab editing (might be too difficult to implement)
  - [x] AI Cleanup
  - [x] Link to session
- [x] Characters
  - [x] Create template
  - [x] Create character from a template
- [ ] Setup RLS
- [x] Create Polls
- [x] Assets
  - [x] Asset types
  - [x] Asset management
  - [x] Asset library
- [ ] Maps
  - [ ] Add map
  - [ ] Generate map
  - [ ] Add markers to map
- [ ] Setup app wide RAG for notes and assets
  - [ ] RAG for notes
  - [ ] RAG for assets
  - [ ] RAG to Chat
  - [ ] RAG to summaries
- [ ] Proper Roles and Permissions System
- [ ] Import assets between campaigns
- [x] Setup proper product analytics
- [ ] Setup Stripe and payments
- [ ] Setup domain
- [ ] Setup emails
- [ ] Move images from public to supabase storage
