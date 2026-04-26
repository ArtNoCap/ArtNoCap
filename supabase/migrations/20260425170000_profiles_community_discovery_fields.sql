-- Community discovery fields for profiles (filters + sorting groundwork)

alter table public.profiles
  add column if not exists specialties text[] not null default array[]::text[];

alter table public.profiles
  add column if not exists experience_level text not null default 'newcomer';

alter table public.profiles
  add column if not exists location text not null default '';

alter table public.profiles
  add column if not exists availability text not null default 'open';

alter table public.profiles drop constraint if exists profiles_experience_level_check;
alter table public.profiles
  add constraint profiles_experience_level_check
  check (experience_level in ('newcomer', 'intermediate', 'pro'));

alter table public.profiles drop constraint if exists profiles_availability_check;
alter table public.profiles
  add constraint profiles_availability_check
  check (availability in ('open', 'soon', 'closed'));

-- Helpful indexes for filtering/search
create index if not exists profiles_style_keywords_gin on public.profiles using gin (style_keywords);
create index if not exists profiles_specialties_gin on public.profiles using gin (specialties);
create index if not exists profiles_profile_role_idx on public.profiles (profile_role);
create index if not exists profiles_availability_idx on public.profiles (availability);
create index if not exists profiles_experience_level_idx on public.profiles (experience_level);

