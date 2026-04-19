-- Extended user profiles + public avatar storage

alter table public.profiles
  add column if not exists bio text not null default '';

alter table public.profiles
  add column if not exists profile_role text not null default 'both';

alter table public.profiles
  add column if not exists style_keywords text[] not null default array[]::text[];

alter table public.profiles drop constraint if exists profiles_profile_role_check;
alter table public.profiles
  add constraint profiles_profile_role_check
  check (profile_role in ('artist', 'collector', 'both'));

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Public read avatars" on storage.objects;
create policy "Public read avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');
