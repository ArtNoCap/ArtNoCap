-- Profiles + favorites + submission ownership (Auth)

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
on public.profiles
for select
to public
using (true);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Creator'),
    null
  )
  on conflict (id) do update
    set display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Favorites
create table if not exists public.favorite_projects (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists public.favorite_submissions (
  user_id uuid not null references auth.users (id) on delete cascade,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, submission_id)
);

alter table public.favorite_projects enable row level security;
alter table public.favorite_submissions enable row level security;

drop policy if exists "Users manage favorite projects" on public.favorite_projects;
drop policy if exists "Users read their favorite projects" on public.favorite_projects;
create policy "Users manage favorite projects"
on public.favorite_projects
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage favorite submissions" on public.favorite_submissions;
drop policy if exists "Users read their favorite submissions" on public.favorite_submissions;
create policy "Users manage favorite submissions"
on public.favorite_submissions
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Submissions: associate uploads with auth user (server still uses service role for insert)
alter table public.submissions
  add column if not exists user_id uuid references auth.users (id) on delete set null;

-- Replace uniqueness model: one submission per user per project (when user_id present)
alter table public.submissions drop constraint if exists submissions_project_id_submitter_key_key;

create unique index if not exists submissions_one_per_user_project
on public.submissions (project_id, user_id)
where user_id is not null;

create unique index if not exists submissions_one_per_browser_project
on public.submissions (project_id, submitter_key)
where user_id is null;
