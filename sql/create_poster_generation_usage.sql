create extension if not exists pgcrypto;

create table if not exists public.poster_generation_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_key text not null,
  window_start timestamptz not null,
  window_end timestamptz not null,
  used_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists poster_generation_usage_user_feature_window_idx
  on public.poster_generation_usage (user_id, feature_key, window_start);

create index if not exists poster_generation_usage_user_id_idx
  on public.poster_generation_usage (user_id);
