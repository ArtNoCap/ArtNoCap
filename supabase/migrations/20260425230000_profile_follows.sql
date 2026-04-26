-- Follow graph between authenticated user profiles.
-- Used for the public /artists/[slug] "Follow" button and the /profile "Following" list.

create table if not exists public.profile_follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint profile_follows_no_self check (follower_id <> following_id)
);

comment on table public.profile_follows is 'Follower relationships between authenticated users and public.profiles.';

create index if not exists profile_follows_follower_created_idx
  on public.profile_follows (follower_id, created_at desc);

create index if not exists profile_follows_following_created_idx
  on public.profile_follows (following_id, created_at desc);

alter table public.profile_follows enable row level security;

-- Authenticated users can read and manage ONLY the rows where they are the follower.
drop policy if exists "Users read own follows" on public.profile_follows;
create policy "Users read own follows"
on public.profile_follows
for select
to authenticated
using (auth.uid() = follower_id);

drop policy if exists "Users create own follows" on public.profile_follows;
create policy "Users create own follows"
on public.profile_follows
for insert
to authenticated
with check (auth.uid() = follower_id);

drop policy if exists "Users delete own follows" on public.profile_follows;
create policy "Users delete own follows"
on public.profile_follows
for delete
to authenticated
using (auth.uid() = follower_id);
