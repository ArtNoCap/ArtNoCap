-- Soft-archive projects (hidden from browse) and mark submissions archived for future search.

alter table public.projects
  add column if not exists archived_at timestamptz null;

alter table public.submissions
  add column if not exists archived_at timestamptz null;

create index if not exists projects_active_idx on public.projects (created_at desc)
  where archived_at is null;

create index if not exists submissions_project_active_idx on public.submissions (project_id)
  where archived_at is null;

-- When a project is archived, stamp all its submissions (runs as definer so RLS does not block).
create or replace function public.archive_submissions_when_project_archived()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.archived_at is not null
     and old.archived_at is null then
    update public.submissions s
    set archived_at = new.archived_at
    where s.project_id = new.id
      and s.archived_at is null;
  end if;
  return new;
end;
$$;

drop trigger if exists projects_archive_submissions on public.projects;
create trigger projects_archive_submissions
after update of archived_at on public.projects
for each row
execute function public.archive_submissions_when_project_archived();

-- Public catalog: only non-archived projects and submissions.
drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
on public.projects
for select
to public
using (archived_at is null);

drop policy if exists "Creators read own projects" on public.projects;
create policy "Creators read own projects"
on public.projects
for select
to authenticated
using (creator_user_id = auth.uid());

drop policy if exists "Public read submissions" on public.submissions;
create policy "Public read submissions"
on public.submissions
for select
to public
using (archived_at is null);

-- Submitters can still see their own rows (including archived) on profile, etc.
drop policy if exists "Submitters read own submissions" on public.submissions;
create policy "Submitters read own submissions"
on public.submissions
for select
to authenticated
using (user_id = auth.uid());
