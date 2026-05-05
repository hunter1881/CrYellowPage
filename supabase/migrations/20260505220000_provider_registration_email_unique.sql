-- Defense-in-depth against double-submit duplicates in provider_registrations.
-- The qa-tester's exploratory run on 2026-05-05 (BUG-003) showed that calling
-- form.requestSubmit() twice synchronously creates two pending registration
-- rows for the same email. The primary fix lives in src/layouts/BaseLayout.astro
-- (re-entry guard on the submit event); this index guards against:
--   - Direct API calls that bypass the browser form
--   - Network race conditions where two POSTs reach the server simultaneously
--
-- Partial unique constraint on email WHERE status='pending':
-- once a registration is approved/rejected, the email is freed up for
-- re-application (legitimate UX — a rejected applicant can re-apply later).

create unique index if not exists provider_registrations_email_pending_unique
on public.provider_registrations (email)
where status = 'pending';
