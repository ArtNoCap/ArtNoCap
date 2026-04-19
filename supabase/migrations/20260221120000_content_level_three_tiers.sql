-- Three-tier content level (replaces six legacy maturity ids).

update public.projects
set content_rating = case
  when content_rating in ('g', 'pg') then 'standard'
  when content_rating in ('pg-13', 'r') then 'expressive'
  when content_rating in ('unhinged-mom', 'unhinged-private') then 'unrestricted'
  when content_rating in ('standard', 'expressive', 'unrestricted') then content_rating
  else 'standard'
end;

alter table public.projects
  alter column content_rating set default 'standard';
