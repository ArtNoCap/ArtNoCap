-- Profile banner images (public read; uploads via service role route)

alter table public.profiles
  add column if not exists banner_url text;

insert into storage.buckets (id, name, public)
values ('profile-banners', 'profile-banners', true)
on conflict (id) do nothing;

drop policy if exists "Public read profile banners" on storage.objects;
create policy "Public read profile banners"
on storage.objects
for select
to public
using (bucket_id = 'profile-banners');

