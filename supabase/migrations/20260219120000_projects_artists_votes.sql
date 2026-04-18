-- Projects, artists, and persisted votes (one vote per authenticated user per project).

-- ---------------------------------------------------------------------------
-- Artists (public directory rows; not the same as auth profiles)
-- ---------------------------------------------------------------------------
create table if not exists public.artists (
  id text primary key,
  slug text not null unique,
  display_name text not null,
  avatar_url text not null,
  bio text not null default '',
  joined_at timestamptz not null default now(),
  stats jsonb not null default '{}'::jsonb
);

alter table public.artists enable row level security;

drop policy if exists "Public read artists" on public.artists;
create policy "Public read artists"
on public.artists
for select
to public
using (true);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id text primary key,
  slug text not null unique,
  title text not null,
  brief text not null default '',
  details_html text not null default '',
  tags text[] not null default array[]::text[],
  creator_id text not null references public.artists (id) on delete restrict,
  categories text[] not null default array[]::text[],
  cover_image_url text not null,
  ends_at timestamptz not null,
  submission_count int not null default 0,
  vote_count int not null default 0,
  created_at timestamptz not null default now(),
  content_rating text not null default 'pg'
);

create index if not exists projects_creator_id_idx on public.projects (creator_id);
create index if not exists projects_ends_at_idx on public.projects (ends_at);

alter table public.projects enable row level security;

drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
on public.projects
for select
to public
using (true);

-- ---------------------------------------------------------------------------
-- Votes: at most one row per (user_id, project_id); submission_id is the pick
-- ---------------------------------------------------------------------------
create table if not exists public.votes (
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id text not null references public.projects (id) on delete cascade,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index if not exists votes_project_id_idx on public.votes (project_id);
create index if not exists votes_submission_id_idx on public.votes (submission_id);

drop trigger if exists votes_set_updated_at on public.votes;
create trigger votes_set_updated_at
before update on public.votes
for each row execute function public.set_updated_at();

alter table public.votes enable row level security;

drop policy if exists "Users manage own votes" on public.votes;
create policy "Users manage own votes"
on public.votes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Maintain submission_count on projects
-- ---------------------------------------------------------------------------
create or replace function public.refresh_project_submission_count(p_project_id text)
returns void
language plpgsql
as $$
begin
  update public.projects pr
  set submission_count = (
    select count(*)::int from public.submissions s where s.project_id = p_project_id
  )
  where pr.id = p_project_id;
end;
$$;

create or replace function public.submissions_touch_project_submission_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_project_submission_count(old.project_id);
  else
    perform public.refresh_project_submission_count(new.project_id);
    if tg_op = 'UPDATE' and old.project_id is distinct from new.project_id then
      perform public.refresh_project_submission_count(old.project_id);
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists submissions_refresh_project_submission_count on public.submissions;
create trigger submissions_refresh_project_submission_count
after insert or update or delete on public.submissions
for each row execute function public.submissions_touch_project_submission_count();

-- ---------------------------------------------------------------------------
-- Maintain vote_count on submissions + projects from votes table
-- ---------------------------------------------------------------------------
create or replace function public.refresh_submission_and_project_vote_counts(p_project_id text)
returns void
language plpgsql
as $$
begin
  update public.submissions s
  set vote_count = coalesce(v.cnt, 0)
  from (
    select submission_id, count(*)::int as cnt
    from public.votes
    where project_id = p_project_id
    group by submission_id
  ) v
  where s.id = v.submission_id;

  update public.submissions s
  set vote_count = 0
  where s.project_id = p_project_id
    and not exists (select 1 from public.votes vv where vv.submission_id = s.id);

  update public.projects p
  set vote_count = (
    select coalesce(sum(s.vote_count), 0)::int
    from public.submissions s
    where s.project_id = p_project_id
  )
  where p.id = p_project_id;
end;
$$;

create or replace function public.votes_refresh_counts()
returns trigger
language plpgsql
as $$
declare
  pid text;
begin
  if tg_op = 'DELETE' then
    pid := old.project_id;
  else
    pid := new.project_id;
  end if;

  perform public.refresh_submission_and_project_vote_counts(pid);

  if tg_op = 'UPDATE' and old.project_id is distinct from new.project_id then
    perform public.refresh_submission_and_project_vote_counts(old.project_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists votes_refresh_submission_project_counts on public.votes;
create trigger votes_refresh_submission_project_counts
after insert or update or delete on public.votes
for each row execute function public.votes_refresh_counts();

-- ---------------------------------------------------------------------------
-- Catalog: add artists/projects via the app (Start a project) or manual SQL.
-- ---------------------------------------------------------------------------

-- Recompute counts from live submissions
update public.projects pr
set submission_count = (
  select count(*)::int from public.submissions s where s.project_id = pr.id
);

update public.projects pr
set vote_count = (
  select coalesce(sum(s.vote_count), 0)::int from public.submissions s where s.project_id = pr.id
);

-- Link submissions to catalog projects (after seed so existing rows validate)
alter table public.submissions
  drop constraint if exists submissions_project_id_fkey;

alter table public.submissions
  add constraint submissions_project_id_fkey
  foreign key (project_id) references public.projects (id)
  on delete restrict;
