-- Gate profile discovery on email verification
-- Community + /artists/:slug should only show profiles with verified emails.

alter table public.profiles
  add column if not exists email_verified boolean not null default false;

comment on column public.profiles.email_verified is 'True once auth.users.email_confirmed_at is set (verified).';

-- Backfill from auth.users (best-effort)
update public.profiles p
set email_verified = (u.email_confirmed_at is not null)
from auth.users u
where u.id = p.id;

create index if not exists profiles_email_verified_true_idx
  on public.profiles (email_verified)
  where email_verified = true;

-- When a user verifies their email, reflect it into profiles (runs as definer).
create or replace function public.sync_profile_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and old.email_confirmed_at is null
     and new.email_confirmed_at is not null then
    update public.profiles
    set email_verified = true
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified
after update of email_confirmed_at on auth.users
for each row
execute function public.sync_profile_email_verified();

-- Ensure new profile rows set the flag correctly at insert time.
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
  verified boolean;
begin
  base_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Creator');
  verified := (new.email_confirmed_at is not null);

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

  insert into public.profiles (id, display_name, avatar_url, slug, email_verified)
  values (new.id, base_name, null, final_slug, verified)
  on conflict (id) do update
    set display_name = excluded.display_name;

  return new;
end;
$$;

