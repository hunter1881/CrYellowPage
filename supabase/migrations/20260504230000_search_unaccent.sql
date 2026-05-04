-- Enable unaccent extension (available in Supabase by default)
create extension if not exists unaccent with schema extensions;

-- Immutable wrapper required for use inside GIN indexes.
-- Declaring IMMUTABLE is safe because the unaccent dictionary never changes at runtime.
create or replace function public.immutable_unaccent(text)
returns text
language sql immutable parallel safe strict
as $$ select extensions.unaccent($1) $$;

-- Recreate GIN index using unaccent so accented/unaccented queries both hit it
drop index if exists public.idx_providers_fts;

create index idx_providers_fts
  on public.providers
  using gin (
    to_tsvector(
      'spanish',
      public.immutable_unaccent(coalesce(name, '') || ' ' || coalesce(description, ''))
    )
  );

-- Update the search RPC to normalize the query too
create or replace function public.search_providers(
  q           text,
  p_district  uuid  default null,
  p_limit     int   default 20,
  p_offset    int   default 0
)
returns table (
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
  response_time_minutes integer,
  district_id           uuid,
  rank                  real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.phone,
    p.whatsapp,
    p.description,
    p.photo_url,
    p.created_at,
    p.accepts_sinpe,
    p.works_weekends,
    p.years_active,
    p.completed_jobs,
    p.response_time_minutes,
    p.district_id,
    ts_rank(
      to_tsvector('spanish', public.immutable_unaccent(coalesce(p.name, '') || ' ' || coalesce(p.description, ''))),
      plainto_tsquery('spanish', public.immutable_unaccent(q))
    ) as rank
  from public.providers p
  where
    p.verified = true
    and to_tsvector('spanish', public.immutable_unaccent(coalesce(p.name, '') || ' ' || coalesce(p.description, '')))
        @@ plainto_tsquery('spanish', public.immutable_unaccent(q))
    and (p_district is null or p.district_id = p_district)
  order by rank desc
  limit p_limit
  offset p_offset;
$$;

grant execute on function public.search_providers(text, uuid, int, int) to anon, authenticated;
