-- ================================================================
-- Migration: Phase 2 — Phone verification + community reports
-- ================================================================

-- 1. phone_verified column on providers
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;

-- 2. phone_otp_codes — short-lived OTP codes, never exposed to public
CREATE TABLE IF NOT EXISTS public.phone_otp_codes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  phone       text        NOT NULL,
  code        text        NOT NULL,
  expires_at  timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_provider
  ON public.phone_otp_codes(provider_id);

-- Partial index on active codes for fast lookup
CREATE INDEX IF NOT EXISTS idx_otp_phone_active
  ON public.phone_otp_codes(phone, expires_at)
  WHERE used = false;

-- RLS: No public policies — only touched via service_role in action handlers
ALTER TABLE public.phone_otp_codes ENABLE ROW LEVEL SECURITY;

-- 3. provider_reports — community fraud/quality reports
CREATE TABLE IF NOT EXISTS public.provider_reports (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid        NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  reporter_id uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  reason      text        NOT NULL CHECK (reason IN (
    'fraud', 'fake_info', 'no_show', 'bad_quality', 'spam', 'other'
  )),
  details     text        CHECK (details IS NULL OR length(details) <= 500),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_provider
  ON public.provider_reports(provider_id);

CREATE INDEX IF NOT EXISTS idx_reports_reason
  ON public.provider_reports(provider_id, reason);

ALTER TABLE public.provider_reports ENABLE ROW LEVEL SECURITY;

-- Anon and authenticated users can submit reports
CREATE POLICY "reports_public_insert" ON public.provider_reports
  FOR INSERT WITH CHECK (
    reporter_id IS NULL
    OR (select auth.uid()) = reporter_id
  );

-- 4. Auto-approve trigger: BEFORE UPDATE on providers.
--    When phone_verified flips true and description meets minimum length → set verified=true.
CREATE OR REPLACE FUNCTION public.auto_approve_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.phone_verified = true
     AND NEW.verified = false
     AND length(coalesce(NEW.description, '')) >= 30
  THEN
    NEW.verified := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provider_auto_approve ON public.providers;
CREATE TRIGGER trg_provider_auto_approve
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  WHEN (NEW.phone_verified = true AND OLD.phone_verified IS DISTINCT FROM NEW.phone_verified)
  EXECUTE FUNCTION public.auto_approve_provider();

-- 5. Auto-hide trigger: AFTER INSERT on provider_reports.
--    3+ fraud/fake_info reports → un-verify the provider (admin can re-verify after review).
CREATE OR REPLACE FUNCTION public.auto_flag_reported_provider()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fraud_count integer;
BEGIN
  SELECT count(*) INTO fraud_count
  FROM public.provider_reports
  WHERE provider_id = NEW.provider_id
    AND reason IN ('fraud', 'fake_info');

  IF fraud_count >= 3 THEN
    UPDATE public.providers
      SET verified = false
      WHERE id = NEW.provider_id
        AND verified = true; -- skip no-op updates
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provider_auto_flag ON public.provider_reports;
CREATE TRIGGER trg_provider_auto_flag
  AFTER INSERT ON public.provider_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_flag_reported_provider();

-- 6. Service role access (used by action handlers that manage OTPs)
GRANT SELECT, INSERT, UPDATE ON public.phone_otp_codes TO service_role;
GRANT SELECT, INSERT ON public.provider_reports TO service_role;
