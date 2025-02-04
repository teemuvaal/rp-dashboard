-- Assets

create table public.assets (
  id uuid not null default gen_random_uuid (),
  campaign_id uuid not null,
  user_id uuid not null,
  title text not null,
  description text null,
  content text not null,
  type public.asset_type not null,
  is_public boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint assets_pkey primary key (id),
  constraint assets_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id) on delete CASCADE,
  constraint assets_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_assets_campaign_id on public.assets using btree (campaign_id) TABLESPACE pg_default;

create index IF not exists idx_assets_user_id on public.assets using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_assets_type on public.assets using btree (type) TABLESPACE pg_default;

-- Campaign Members
create table public.campaign_members (
  id uuid not null default extensions.uuid_generate_v4 (),
  campaign_id uuid not null,
  user_id uuid not null,
  role text not null default 'member'::text,
  joined_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint campaign_members_pkey primary key (id),
  constraint campaign_members_campaign_id_user_id_key unique (campaign_id, user_id),
  constraint campaign_members_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id),
  constraint campaign_members_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_campaign_members_campaign_id on public.campaign_members using btree (campaign_id) TABLESPACE pg_default;

create index IF not exists idx_campaign_members_user_id on public.campaign_members using btree (user_id) TABLESPACE pg_default;

-- Campaigns
create table public.campaigns (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  description text null,
  owner_id uuid not null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  campaign_image text null,
  tags text[] null default '{}'::text[],
  share_id uuid null default extensions.uuid_generate_v4 (),
  constraint campaigns_pkey primary key (id),
  constraint campaigns_share_id_key unique (share_id),
  constraint campaigns_owner_id_fkey foreign KEY (owner_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists idx_campaign_tags on public.campaigns using gin (tags) TABLESPACE pg_default;

create index IF not exists idx_campaigns_owner_id on public.campaigns using btree (owner_id) TABLESPACE pg_default;

-- Notes
create table public.notes (
  id uuid not null default extensions.uuid_generate_v4 (),
  campaign_id uuid not null,
  session_id uuid null,
  user_id uuid not null,
  title text not null,
  content text not null,
  is_public boolean not null default false,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint notes_pkey primary key (id),
  constraint notes_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id),
  constraint notes_session_id_fkey foreign KEY (session_id) references sessions (id),
  constraint notes_user_id_fkey1 foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_notes_campaign_id on public.notes using btree (campaign_id) TABLESPACE pg_default;

create index IF not exists idx_notes_session_id on public.notes using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_notes_user_id on public.notes using btree (user_id) TABLESPACE pg_default;

-- Poll Options
create table public.poll_options (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid null,
  option_text text not null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint poll_options_pkey primary key (id),
  constraint poll_options_poll_id_fkey foreign KEY (poll_id) references polls (id) on delete CASCADE
) TABLESPACE pg_default;

-- Poll Votes
create table public.poll_votes (
  id uuid not null default extensions.uuid_generate_v4 (),
  poll_id uuid null,
  option_id uuid null,
  user_id uuid null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint poll_votes_pkey primary key (id),
  constraint poll_votes_poll_id_option_id_user_id_key unique (poll_id, option_id, user_id),
  constraint poll_votes_option_id_fkey foreign KEY (option_id) references poll_options (id) on delete CASCADE,
  constraint poll_votes_poll_id_fkey foreign KEY (poll_id) references polls (id) on delete CASCADE,
  constraint poll_votes_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Polls
create table public.polls (
  id uuid not null default extensions.uuid_generate_v4 (),
  campaign_id uuid null,
  title text not null,
  description text null,
  allow_multiple boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  created_by uuid null,
  constraint polls_pkey primary key (id),
  constraint polls_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id) on delete CASCADE,
  constraint polls_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Posts
create table public.posts (
  id uuid not null default extensions.uuid_generate_v4 (),
  campaign_id uuid not null,
  user_id uuid not null,
  title text not null,
  content text not null,
  session_id uuid null,
  note_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint posts_pkey primary key (id),
  constraint posts_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id),
  constraint posts_note_id_fkey foreign KEY (note_id) references notes (id),
  constraint posts_session_id_fkey foreign KEY (session_id) references sessions (id),
  constraint posts_user_id_fkey1 foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create index IF not exists idx_posts_campaign_id on public.posts using btree (campaign_id) TABLESPACE pg_default;

create index IF not exists idx_posts_note_id on public.posts using btree (note_id) TABLESPACE pg_default;

create index IF not exists idx_posts_session_id on public.posts using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_posts_user_id on public.posts using btree (user_id) TABLESPACE pg_default;

-- Session Summaries
create table public.session_summaries (
  id uuid not null default extensions.uuid_generate_v4 (),
  session_id uuid null,
  content text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint session_summaries_pkey primary key (id),
  constraint session_summaries_session_id_fkey foreign KEY (session_id) references sessions (id) on delete CASCADE
) TABLESPACE pg_default;

-- Session Visual Summaries
create table public.session_visual_summaries (
  id uuid not null default extensions.uuid_generate_v4 (),
  session_id uuid null,
  summary_id uuid null,
  highlights jsonb null,
  image_urls jsonb null,
  image_prompts jsonb null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  narrative_content text null,
  constraint session_visual_summaries_pkey primary key (id),
  constraint session_visual_summaries_session_id_fkey foreign KEY (session_id) references sessions (id) on delete CASCADE,
  constraint session_visual_summaries_summary_id_fkey foreign KEY (summary_id) references session_summaries (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_session_visual_summaries_session_id on public.session_visual_summaries using btree (session_id) TABLESPACE pg_default;

-- Sessions
create table public.sessions (
  id uuid not null default extensions.uuid_generate_v4 (),
  campaign_id uuid not null,
  name text not null,
  description text null,
  scheduled_date timestamp with time zone null,
  duration_minutes integer null,
  status text null,
  player_attendance jsonb null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint sessions_pkey primary key (id),
  constraint sessions_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id),
  constraint sessions_status_check check (
    (
      status = any (
        array[
          'scheduled'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_sessions_campaign_id on public.sessions using btree (campaign_id) TABLESPACE pg_default;

-- Users
create table public.users (
  id uuid not null,
  email text null,
  username text null,
  profile_picture text null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id),
  constraint users_username_check check ((length(username) < 20))
) TAcreate table public.users (
  id uuid not null,
  email text null,
  username text null,
  profile_picture text null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id),
  constraint users_username_check check ((length(username) < 20))
) TABLESPACE pg_default;BLESPACE pg_default;