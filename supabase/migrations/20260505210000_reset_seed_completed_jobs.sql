-- Reset completed_jobs to 0 for seed providers so the counter starts from real
-- "work confirmed" reviews only. These hardcoded values were never real data.
UPDATE public.providers
SET completed_jobs = 0
WHERE id IN (
  '00000000-0000-4000-8000-000000000301',
  '00000000-0000-4000-8000-000000000302',
  '00000000-0000-4000-8000-000000000303'
);
