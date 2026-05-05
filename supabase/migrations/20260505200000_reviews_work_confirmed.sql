-- Add work_confirmed flag so reviewers can indicate the job was completed.
-- When true, a trigger auto-increments providers.completed_jobs.

alter table public.reviews
  add column if not exists work_confirmed boolean not null default false;

-- Trigger function: increment completed_jobs on confirmed work reviews
create or replace function public.handle_review_work_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.work_confirmed = true then
    update public.providers
      set completed_jobs = completed_jobs + 1
      where id = NEW.provider_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists reviews_work_confirmed on public.reviews;
create trigger reviews_work_confirmed
  after insert on public.reviews
  for each row execute function public.handle_review_work_confirmed();

-- Replace the auth-only policy with one that also allows anonymous inserts.
-- Authenticated users may optionally link their session via author_id.
-- Anonymous reviews have author_id = null.
drop policy if exists "reviews_authenticated_insert" on public.reviews;
create policy "reviews_public_insert" on public.reviews
  for insert with check (
    author_id is null
    or auth.uid() = author_id
  );
