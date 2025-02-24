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
  visual_summary_id uuid null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint posts_pkey primary key (id),
  constraint posts_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id),
  constraint posts_note_id_fkey foreign KEY (note_id) references notes (id),
  constraint posts_session_id_fkey foreign KEY (session_id) references sessions (id),
  constraint posts_user_id_fkey1 foreign KEY (user_id) references users (id),
  constraint posts_visual_summary_id_fkey foreign KEY (visual_summary_id) references session_visual_summaries (id)
) TABLESPACE pg_default;

create index IF not exists idx_posts_campaign_id on public.posts using btree (campaign_id) TABLESPACE pg_default;

create index IF not exists idx_posts_note_id on public.posts using btree (note_id) TABLESPACE pg_default;

create index IF not exists idx_posts_session_id on public.posts using btree (session_id) TABLESPACE pg_default;

create index IF not exists idx_posts_user_id on public.posts using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_posts_visual_summary_id on public.posts using btree (visual_summary_id) TABLESPACE pg_default;

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
) TABLESPACE pg_default;


-- Characters
create table public.characters (
  id uuid not null default gen_random_uuid (),
  campaign_id uuid not null,
  user_id uuid not null,
  template_id uuid not null,
  name text not null,
  data jsonb not null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  portrait_url text null,
  constraint characters_pkey primary key (id),
  constraint characters_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id) on delete CASCADE,
  constraint characters_template_id_fkey foreign KEY (template_id) references character_templates (id) on delete RESTRICT,
  constraint characters_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_characters_campaign_id on public.characters using btree (campaign_id) TABLESPACE pg_default;

create index IF not exists idx_characters_user_id on public.characters using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_characters_template_id on public.characters using btree (template_id) TABLESPACE pg_default;

-- Character Templates
create table public.character_templates (
  id uuid not null default gen_random_uuid (),
  campaign_id uuid not null,
  name text not null,
  description text null,
  schema jsonb not null,
  ui_schema jsonb null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint character_templates_pkey primary key (id),
  constraint character_templates_campaign_id_fkey foreign KEY (campaign_id) references campaigns (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_character_templates_campaign_id on public.character_templates using btree (campaign_id) TABLESPACE pg_default;

-- Subscription Plans (Reference table for available plans)
create table public.subscription_plans (
    id uuid not null default gen_random_uuid(),
    name text not null,
    description text,
    features jsonb not null default '{}',
    is_active boolean not null default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint subscription_plans_pkey primary key (id)
) tablespace pg_default;

-- Add default plans
insert into public.subscription_plans (name, description, features) values
    ('free', 'Free tier with basic features', '{"has_audio_narration": false, "max_campaigns": 1}'),
    ('pro', 'Pro tier with advanced features', '{"has_audio_narration": true, "max_campaigns": -1}');

-- User Subscriptions
create table public.user_subscriptions (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    plan_id uuid not null references subscription_plans(id),
    status text not null default 'active',
    current_period_start timestamp with time zone not null default now(),
    current_period_end timestamp with time zone,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint user_subscriptions_pkey primary key (id),
    constraint user_subscriptions_user_id_key unique (user_id),
    constraint user_subscriptions_status_check check (status in ('active', 'inactive', 'cancelled'))
) tablespace pg_default;

-- Create index for faster lookups
create index idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index idx_user_subscriptions_plan_id on public.user_subscriptions(plan_id);

-- RLS Policies to protect subscription data
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;

-- Policies for subscription_plans
create policy "Allow read access to subscription_plans for all authenticated users"
    on public.subscription_plans for select
    to authenticated
    using (true);

-- Policies for user_subscriptions
create policy "Allow users to read only their own subscription"
    on public.user_subscriptions for select
    to authenticated
    using (auth.uid() = user_id);

-- Need to IMPLEMENT THE SUPERADMIN ROLE
create policy "Only allow superadmin to insert/update/delete subscriptions"
    on public.user_subscriptions for all
    to superadmin
    using (true)
    with check (true);

-- Function to automatically create a free subscription for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    free_plan_id uuid;
begin
    -- Get the ID of the free plan
    select id into free_plan_id from subscription_plans where name = 'free' limit 1;
    
    -- Create a subscription for the new user
    insert into public.user_subscriptions (user_id, plan_id, current_period_end)
    values (new.id, free_plan_id, now() + interval '100 years');
    
    return new;
end;
$$;

-- Trigger to create free subscription when a new user is created
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Helper function to check if a user has audio narration access
create or replace function public.user_has_audio_narration(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
    has_access boolean;
begin
    select (features->>'has_audio_narration')::boolean into has_access
    from public.user_subscriptions us
    join public.subscription_plans sp on us.plan_id = sp.id
    where us.user_id = user_has_audio_narration.user_id
    and us.status = 'active'
    and current_timestamp between us.current_period_start and us.current_period_end;
    
    return coalesce(has_access, false);
end;
$$;