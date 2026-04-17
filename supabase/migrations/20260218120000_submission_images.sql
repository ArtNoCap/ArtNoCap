-- ArtNoCap MVP: submissions + public image hosting
-- Run in Supabase SQL editor, or apply via Supabase migrations workflow.

create extension if not exists "pgcrypto";

-- Public bucket for submission images (object paths are unguessable UUIDs)
insert into storage.buckets (id, name, public)
values ('submission-images', 'submission-images', true)
on conflict (id) do nothing;

-- Allow public read of objects in this bucket (writes happen via service role / server route)
drop policy if exists "Public read submission images" on storage.objects;
create policy "Public read submission images"
on storage.objects
for select
to public
using (bucket_id = 'submission-images');

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  project_slug text not null,
  submitter_key text not null,
  image_path text not null,
  public_url text not null,
  vote_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (project_id, submitter_key)
);

alter table public.submissions enable row level security;

-- Public can read submissions (needed for the voting page using anon/publishable keys)
drop policy if exists "Public read submissions" on public.submissions;
create policy "Public read submissions"
on public.submissions
for select
to public
using (true);

-- Writes happen via the service role on the server (bypasses RLS). No insert/update policies for `public`.
