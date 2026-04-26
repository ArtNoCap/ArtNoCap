-- If `is_public` was added earlier with default true, switch default to private for new rows.

alter table public.profiles
  alter column is_public set default false;

comment on column public.profiles.is_public is 'When true, listed on Discover Artists and public /artists/:slug. Default false (private); own /profile always works.';
