-- RPC: list_valid_listing_combinations
-- Returns all (canton_slug, district_slug, category_slug) combinations that have
-- at least 3 verified providers. Used by getStaticPaths() to avoid loading all
-- providers, districts, cantons, and provider_categories into memory.
--
-- Performance: single query with 4 joins + group by + having,
-- vs the previous approach of 5 full-table fetches in Node.js memory.

CREATE OR REPLACE FUNCTION list_valid_listing_combinations(min_providers int DEFAULT 3)
RETURNS TABLE(canton_slug text, district_slug text, category_slug text, provider_count bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    c.slug   AS canton_slug,
    d.slug   AS district_slug,
    cat.slug AS category_slug,
    COUNT(p.id) AS provider_count
  FROM providers p
  INNER JOIN districts d ON p.district_id = d.id
  INNER JOIN cantons c ON d.canton_id = c.id
  INNER JOIN provider_categories pc ON pc.provider_id = p.id
  INNER JOIN categories cat ON pc.category_id = cat.id
  WHERE p.verified = true
  GROUP BY c.slug, d.slug, cat.slug
  HAVING COUNT(p.id) >= min_providers
  ORDER BY c.slug, d.slug, cat.slug
$$;

-- Grant read access to the anon role (used by the Supabase JS client with anon key)
GRANT EXECUTE ON FUNCTION list_valid_listing_combinations(int) TO anon;
GRANT EXECUTE ON FUNCTION list_valid_listing_combinations(int) TO authenticated;
