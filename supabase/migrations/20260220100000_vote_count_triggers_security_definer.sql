-- Vote triggers update submissions/projects vote_count, but those tables only allow
-- public SELECT (no UPDATE for authenticated). Inserts into votes run as the voter,
-- so the trigger must run with elevated rights or RLS blocks the UPDATEs.

alter function public.refresh_submission_and_project_vote_counts(text)
  security definer
  set search_path = public;

alter function public.votes_refresh_counts()
  security definer
  set search_path = public;
