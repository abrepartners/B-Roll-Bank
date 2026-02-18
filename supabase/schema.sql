-- B-Roll Bank MVP Supabase schema

create extension if not exists pgcrypto;

create table if not exists public.app_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_hash text not null unique,
  endpoint text not null,
  subscription_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reminder_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  reminder_date date not null,
  sent_at timestamptz not null default now(),
  unique (user_id, reminder_type, reminder_date)
);

create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions (user_id);

create index if not exists idx_reminder_events_user_id
  on public.reminder_events (user_id);

alter table public.app_user_state enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminder_events enable row level security;

drop policy if exists app_user_state_select_own on public.app_user_state;
drop policy if exists app_user_state_insert_own on public.app_user_state;
drop policy if exists app_user_state_update_own on public.app_user_state;

create policy app_user_state_select_own
  on public.app_user_state
  for select
  using (auth.uid() = user_id);

create policy app_user_state_insert_own
  on public.app_user_state
  for insert
  with check (auth.uid() = user_id);

create policy app_user_state_update_own
  on public.app_user_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists push_subscriptions_select_own on public.push_subscriptions;
drop policy if exists push_subscriptions_insert_own on public.push_subscriptions;
drop policy if exists push_subscriptions_delete_own on public.push_subscriptions;

create policy push_subscriptions_select_own
  on public.push_subscriptions
  for select
  using (auth.uid() = user_id);

create policy push_subscriptions_insert_own
  on public.push_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy push_subscriptions_delete_own
  on public.push_subscriptions
  for delete
  using (auth.uid() = user_id);

drop policy if exists reminder_events_select_own on public.reminder_events;

create policy reminder_events_select_own
  on public.reminder_events
  for select
  using (auth.uid() = user_id);
