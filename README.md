# Adventure Hub

Adventure Hub is a web app for DMs and players to create and share their adventures.

## Notes

This is about building a functioning product with a focus on AI tools and realtime collaboration. Migration to Next.js 15 / React 19 is currently difficult due to the use of Supabase Auth Helpers ReactQuill no working with React 19.

Need to do prover provider for user to avoid refetching user id on some pages.

Need to fix the AI cleanup note function.

## Tech Stack

- Next.js
- Supabase (auth, db, storage)
- TailwindCSS (styling)
- Shadcn UI (components)
- Resend (email)
- OpenAI (AI text)
- Replicate (AI image)
- Upstash (rate limiting)

## Features

- Login with Discord
- Campaign Management (Sessions, Notes, Assets, etc.)
- Craft campaign details: characters, locations, items, etc.
- AI enhanced Session Summaries (OpenAI)
- Create session recaps and stories with images (Replicate)
- Polls to vote for session times or details
- Archive past adventures

## To Do

Below is a list of features that are complete or in progress and should be completed to launch.

- [x] Create Campaign
  - [x] Campaign Setting
  - [x] Campaign Image
    - [x] AI Generate
  - [ ] Campaign Members Management
    - [x] Invite Members
    - [ ] Remove Members
- [x] Create Session
  - [x] Session summary
  - [x] Session recap
  - [ ] Session highlights
- [x] Create Note
  - [x] Show active participants
  - [ ] Collab editing (might be too difficult to implement)
  - [x] AI Cleanup
  - [ ] Link to session
- [ ] Characters
  - [ ] DND Template
  - [ ] Scrape from DND Beyond?
  - [ ] Image-to-Text
- [ ] Setup RLS
- [x] Create Polls
- [x] Assets
  - [x] Asset types
  - [x] Asset management
  - [x] Asset library
- [ ] Proper Roles and Permissions System
- [ ] Import assets between campaigns
