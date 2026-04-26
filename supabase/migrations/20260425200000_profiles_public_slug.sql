-- Public profile slug for routing (/artists/:slug) and Community cards

alter table public.profiles
  add column if not exists slug text;

create unique index if not exists profiles_slug_unique on public.profiles (slug);

-- Backfill slugs for existing rows (best-effort uniqueness using id suffix)
update public.profiles p
set slug = left(
  regexp_replace(
    regexp_replace(lower(trim(p.display_name)), '[^a-z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  ) || '-' || left(replace(p.id::text, '-', ''), 8),
  40
)
where p.slug is null or p.slug = '';

-- Ensure non-empty
update public.profiles p
set slug = 'creator-' || left(replace(p.id::text, '-', ''), 8)
where p.slug is null or p.slug = '';

alter table public.profiles
  alter column slug set not null;

-- New users get a slug at insert time
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_name text;
  base_slug text;
  final_slug text;
begin
  base_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Creator');

  base_slug := regexp_replace(
    regexp_replace(lower(trim(base_name)), '[^a-z0-9]+', '-', 'g'),
    '(^-|-$)',
    '',
    'g'
  );

  if base_slug is null or base_slug = '' then
    base_slug := 'creator';
  end if;

  final_slug := left(base_slug || '-' || left(replace(new.id::text, '-', ''), 8), 40);

  insert into public.profiles (id, display_name, avatar_url, slug)
  values (new.id, base_name, null, final_slug)
  on conflict (id) do update
    set display_name = excluded.display_name;

  return new;
end;
$$;
