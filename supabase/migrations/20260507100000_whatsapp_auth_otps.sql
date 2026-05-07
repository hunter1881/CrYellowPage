-- WhatsApp-first authentication
--
-- 1. whatsapp_auth_otps — stores login OTPs tied to a phone number.
--    No public RLS policies — only accessible via service role.
--
-- 2. Make provider_registrations.email nullable because the registration
--    form no longer collects an email address (WhatsApp is the identifier).
--
-- 3. Add owner_id to provider_registrations so we can link a pending
--    registration to the auth user who sent the OTP.

-- ── 1. Login OTP table ────────────────────────────────────────────────────

create table if not exists public.whatsapp_auth_otps (
  id         uuid        primary key default gen_random_uuid(),
  phone      text        not null,
  code       text        not null,
  expires_at timestamptz not null,
  used       boolean     not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_whatsapp_auth_otps_phone_lookup
  on public.whatsapp_auth_otps (phone, used, expires_at desc);

alter table public.whatsapp_auth_otps enable row level security;
-- No public SELECT/INSERT/UPDATE/DELETE policies — service role only.

-- ── 2. Make email nullable ────────────────────────────────────────────────

alter table public.provider_registrations
  alter column email drop not null;

-- ── 3. Add owner_id to provider_registrations ────────────────────────────

alter table public.provider_registrations
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists idx_provider_registrations_owner
  on public.provider_registrations (owner_id)
  where owner_id is not null;
-- ── 4. Allow users to read their own registrations (needed by account dashboard) ─

create policy "provider_registrations_owner_select"
  on public.provider_registrations
  for select
  to authenticated
  using (owner_id = auth.uid());

-- ── 5. Swap duplicate-prevention index from email to phone ────────────────────
-- Email is now optional (dropped NOT NULL above); phone is the deduplication key.

drop index if exists provider_registrations_email_pending_unique;

create unique index if not exists provider_registrations_phone_pending_unique
  on public.provider_registrations (phone)
  where status = 'pending';