# Adventure Hub

Adventure Hub is a web app for DMs and players to create and share their adventures.

## Notes

This is about building a functioning product with a focus on AI tools and realtime collaboration. Migration to Next.js 15 / React 19 is currently difficult due to the use of Supabase Auth Helpers ReactQuill no working with React 19.

## Tech Stack

- Next.js
- Supabase (auth, db, storage)
- TailwindCSS
- Shadcn UI
- Resend
- OpenAI

## Features

- Campaign Management (Sessions, Notes, Assets, etc.)
- Collaboration (Realtime) for Notes
- AI enhanced Session Summaries

## To Do

Below is a list of features that are complete or in progress and should be completed to launch.

- [x] Create Campaign
  - [x] Campaign Setting
  - [x] Campaign Image
    - [ ] AI Generate
  - [ ] Campaign Members Management
    - [x] Invite Members
    - [ ] Remove Members
- [x] Create Session
  - [ ] Session summary
  - [ ] Session recap
- [x] Create Note
  - [x] Show active participants
  - [ ] Collab editing
  - [ ] AI Cleanup
- [ ] Characters
  - [ ] DND Template
  - [ ] Scrape from DND Beyond?
- [ ] Setup RLS
- [ ] Session polling
- [ ] Assets
  - [ ] Asset types
  - [ ] Asset management
  - [ ] Asset library
- [ ] Proper Roles and Permissions System