create table if not exists public.menu_analytics_events (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  menu_id bigint not null,
  event_type text not null check (event_type in ('menu_view', 'dish_view')),
  dish_id text null,
  session_id text null,
  path text null,
  user_agent text null,
  referrer text null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists menu_analytics_events_user_created_idx
on public.menu_analytics_events (user_id, created_at desc);

create index if not exists menu_analytics_events_menu_created_idx
on public.menu_analytics_events (menu_id, created_at desc);

create index if not exists menu_analytics_events_event_created_idx
on public.menu_analytics_events (event_type, created_at desc);

create index if not exists menu_analytics_events_dish_idx
on public.menu_analytics_events (dish_id)
where dish_id is not null;

alter table public.menu_analytics_events enable row level security;

create policy if not exists "menu_analytics_select_own"
on public.menu_analytics_events
for select
using (auth.uid() = user_id);
