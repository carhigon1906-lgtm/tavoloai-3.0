-- Create poster_presets table for /dashboard/posters
create table if not exists public.poster_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.poster_presets enable row level security;

-- Users can read only their own presets
create policy if not exists "poster_presets_select_own"
on public.poster_presets
for select
using (auth.uid() = user_id);

-- Users can insert only their own presets
create policy if not exists "poster_presets_insert_own"
on public.poster_presets
for insert
with check (auth.uid() = user_id);

-- Optional: users can update/delete their own presets
create policy if not exists "poster_presets_update_own"
on public.poster_presets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "poster_presets_delete_own"
on public.poster_presets
for delete
using (auth.uid() = user_id);

create index if not exists poster_presets_user_created_idx
on public.poster_presets (user_id, created_at desc);
