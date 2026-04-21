-- Guest voting: one pick per browser session per project (HttpOnly cookie id, server-side only).

create table if not exists public.anonymous_votes (
  session_id text not null,
  project_id text not null references public.projects (id) on delete cascade,
  submission_id uuid not null references public.submissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (session_id, project_id)
);

create index if not exists anonymous_votes_project_id_idx on public.anonymous_votes (project_id);
create index if not exists anonymous_votes_submission_id_idx on public.anonymous_votes (submission_id);

drop trigger if exists anonymous_votes_set_updated_at on public.anonymous_votes;
create trigger anonymous_votes_set_updated_at
before update on public.anonymous_votes
for each row execute function public.set_updated_at();

alter table public.anonymous_votes enable row level security;
-- No policies: anon/authenticated clients do not write directly; API uses service role.

-- ---------------------------------------------------------------------------
-- Recompute submission + project vote totals from authenticated + guest votes
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
    from (
      select submission_id from public.votes where project_id = p_project_id
      union all
      select submission_id from public.anonymous_votes where project_id = p_project_id
    ) picks
    group by submission_id
  ) v
  where s.id = v.submission_id;

  update public.submissions s
  set vote_count = 0
  where s.project_id = p_project_id
    and not exists (
      select 1 from public.votes vv
      where vv.submission_id = s.id and vv.project_id = p_project_id
    )
    and not exists (
      select 1 from public.anonymous_votes av
      where av.submission_id = s.id and av.project_id = p_project_id
    );

  update public.projects p
  set vote_count = (
    select coalesce(sum(s.vote_count), 0)::int
    from public.submissions s
    where s.project_id = p_project_id
  )
  where p.id = p_project_id;
end;
$$;

create or replace function public.anonymous_votes_refresh_counts()
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

alter function public.anonymous_votes_refresh_counts()
  security definer
  set search_path = public;

drop trigger if exists anonymous_votes_refresh_submission_project_counts on public.anonymous_votes;
create trigger anonymous_votes_refresh_submission_project_counts
after insert or update or delete on public.anonymous_votes
for each row execute function public.anonymous_votes_refresh_counts();

-- Keep vote-count refresh function elevated (already set in prior migration; re-apply after replace)
alter function public.refresh_submission_and_project_vote_counts(text)
  security definer
  set search_path = public;
