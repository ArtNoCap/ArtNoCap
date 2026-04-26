-- Control whether a profile appears on Community and the public /artists/:slug page

alter table public.profiles
  add column if not exists is_public boolean not null default false;

comment on column public.profiles.is_public is 'When true, listed on Discover Artists and public /artists/:slug. Default false (private); own /profile always works.';

create index if not exists profiles_is_public_true_idx on public.profiles (is_public)
  where is_public = true;
