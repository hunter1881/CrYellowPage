-- ================================================================
-- Migration: provider_service_areas
-- Allows providers to declare coverage at district, canton, or
-- country level instead of a single district_id.
-- ================================================================

-- 1. New table: provider_service_areas
--    Each row declares one coverage unit for a provider.
--    A provider may have many rows (several districts, several cantons, etc.)
CREATE TABLE public.provider_service_areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  level       text NOT NULL CHECK (level IN ('country', 'canton', 'district')),
  canton_id   uuid REFERENCES public.cantons(id)   ON DELETE RESTRICT,
  district_id uuid REFERENCES public.districts(id) ON DELETE RESTRICT,
  CONSTRAINT chk_psa_level CHECK (
    (level = 'country'  AND canton_id IS NULL     AND district_id IS NULL) OR
    (level = 'canton'   AND canton_id IS NOT NULL AND district_id IS NULL) OR
    (level = 'district' AND district_id IS NOT NULL AND canton_id IS NULL)
  )
);

CREATE INDEX idx_psa_provider  ON public.provider_service_areas(provider_id);
CREATE INDEX idx_psa_district  ON public.provider_service_areas(district_id) WHERE district_id IS NOT NULL;
CREATE INDEX idx_psa_canton    ON public.provider_service_areas(canton_id)   WHERE canton_id  IS NOT NULL;
CREATE INDEX idx_psa_level     ON public.provider_service_areas(level);

-- 2. Migrate existing providers: one district-level entry per provider
INSERT INTO public.provider_service_areas (provider_id, level, district_id)
SELECT id, 'district', district_id
FROM public.providers
WHERE district_id IS NOT NULL;

-- 3. providers.district_id is now the physical location (optional).
--    Listing queries will use provider_effective_districts instead.
ALTER TABLE public.providers ALTER COLUMN district_id DROP NOT NULL;

-- 4. View: expands service_area rows to concrete (provider_id, district_id) pairs.
--    Used by listing queries and getStaticPaths RPC.
CREATE OR REPLACE VIEW public.provider_effective_districts AS
  -- country coverage → every district
  SELECT psa.provider_id, d.id AS district_id
  FROM public.provider_service_areas psa
  CROSS JOIN public.districts d
  WHERE psa.level = 'country'
  UNION ALL
  -- canton coverage → all districts in that canton
  SELECT psa.provider_id, d.id AS district_id
  FROM public.provider_service_areas psa
  JOIN public.districts d ON d.canton_id = psa.canton_id
  WHERE psa.level = 'canton'
  UNION ALL
  -- district coverage → the listed district directly
  SELECT psa.provider_id, psa.district_id
  FROM public.provider_service_areas psa
  WHERE psa.level = 'district';

GRANT SELECT ON public.provider_effective_districts TO anon, authenticated;

-- 5. RLS on provider_service_areas
ALTER TABLE public.provider_service_areas ENABLE ROW LEVEL SECURITY;

-- Public reads: only if the provider is verified
CREATE POLICY "psa_select_verified" ON public.provider_service_areas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_service_areas.provider_id AND p.verified = true
    )
  );

-- Owner can insert/delete their own service areas
CREATE POLICY "psa_insert_owner" ON public.provider_service_areas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_service_areas.provider_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "psa_delete_owner" ON public.provider_service_areas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = provider_service_areas.provider_id AND p.owner_id = auth.uid()
    )
  );

GRANT SELECT ON public.provider_service_areas TO anon, authenticated;
GRANT INSERT, DELETE ON public.provider_service_areas TO authenticated;

-- 6. provider_registrations: add service_areas jsonb, make district_id optional
ALTER TABLE public.provider_registrations
  ADD COLUMN IF NOT EXISTS service_areas jsonb,
  ALTER COLUMN district_id DROP NOT NULL;

-- Migrate existing pending registrations to the new format
UPDATE public.provider_registrations
SET service_areas = jsonb_build_array(
  jsonb_build_object('level', 'district', 'district_id', district_id::text)
)
WHERE district_id IS NOT NULL AND service_areas IS NULL;

-- 7. Update list_valid_listing_combinations to use provider_effective_districts
--    so canton/country-level providers appear in all their covered listings.
CREATE OR REPLACE FUNCTION list_valid_listing_combinations(min_providers int DEFAULT 3)
RETURNS TABLE(canton_slug text, district_slug text, category_slug text, provider_count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.slug   AS canton_slug,
    d.slug   AS district_slug,
    cat.slug AS category_slug,
    COUNT(DISTINCT ped.provider_id) AS provider_count
  FROM public.provider_effective_districts ped
  INNER JOIN public.providers p    ON p.id  = ped.provider_id AND p.verified = true
  INNER JOIN public.districts d    ON d.id  = ped.district_id
  INNER JOIN public.cantons c      ON c.id  = d.canton_id
  INNER JOIN public.provider_categories pc  ON pc.provider_id  = ped.provider_id
  INNER JOIN public.categories cat ON cat.id = pc.category_id
  GROUP BY c.slug, d.slug, cat.slug
  HAVING COUNT(DISTINCT ped.provider_id) >= min_providers
  ORDER BY c.slug, d.slug, cat.slug
$$;

GRANT EXECUTE ON FUNCTION list_valid_listing_combinations(int) TO anon, authenticated;

-- 8. New RPC: get_providers_for_listing
--    Returns verified providers that cover a given district and belong to a category.
--    GROUP BY deduplicates providers that match the district via multiple service areas.
CREATE OR REPLACE FUNCTION get_providers_for_listing(
  p_district_id uuid,
  p_category_id uuid
)
RETURNS TABLE(
  id                    uuid,
  name                  text,
  phone                 text,
  whatsapp              text,
  description           text,
  photo_url             text,
  created_at            timestamptz,
  accepts_sinpe         boolean,
  works_weekends        boolean,
  years_active          integer,
  completed_jobs        integer,
  response_time_minutes integer
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id, p.name, p.phone, p.whatsapp, p.description, p.photo_url, p.created_at,
    p.accepts_sinpe, p.works_weekends, p.years_active, p.completed_jobs, p.response_time_minutes
  FROM public.providers p
  INNER JOIN public.provider_effective_districts ped
    ON ped.provider_id = p.id AND ped.district_id = p_district_id
  INNER JOIN public.provider_categories pc
    ON pc.provider_id = p.id AND pc.category_id = p_category_id
  WHERE p.verified = true
  GROUP BY
    p.id, p.name, p.phone, p.whatsapp, p.description, p.photo_url, p.created_at,
    p.accepts_sinpe, p.works_weekends, p.years_active, p.completed_jobs, p.response_time_minutes
  ORDER BY p.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION get_providers_for_listing(uuid, uuid) TO anon, authenticated;
