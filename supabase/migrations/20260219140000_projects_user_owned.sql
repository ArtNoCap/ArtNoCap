-- Allow projects owned by auth users (catalog no longer relies on seeded `artists` rows).

alter table public.projects
  add column if not exists creator_user_id uuid references auth.users (id) on delete set null;

alter table public.projects
  alter column creator_id drop not null;

drop policy if exists "Users insert own projects" on public.projects;
create policy "Users insert own projects"
on public.projects
for insert
to authenticated
with check (creator_user_id = auth.uid());

drop policy if exists "Users update own projects" on public.projects;
create policy "Users update own projects"
on public.projects
for update
to authenticated
using (creator_user_id = auth.uid())
with check (creator_user_id = auth.uid());

drop policy if exists "Users delete own projects" on public.projects;
create policy "Users delete own projects"
on public.projects
for delete
to authenticated
using (creator_user_id = auth.uid());
