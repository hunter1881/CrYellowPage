-- GIN index for full-text search on providers (Spanish)
create index if not exists idx_providers_fts
  on public.providers
  using gin (
    to_tsvector(
      'spanish',
      coalesce(name, '') || ' ' || coalesce(description, '')
    )
  );

-- RPC: search_providers
-- Returns verified providers matching a free-text query, optionally scoped to a district.
-- Results ranked by ts_rank descending.
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
      to_tsvector('spanish', coalesce(p.name, '') || ' ' || coalesce(p.description, '')),
      plainto_tsquery('spanish', q)
    ) as rank
  from public.providers p
  where
    p.verified = true
    and to_tsvector('spanish', coalesce(p.name, '') || ' ' || coalesce(p.description, ''))
        @@ plainto_tsquery('spanish', q)
    and (p_district is null or p.district_id = p_district)
  order by rank desc
  limit p_limit
  offset p_offset;
$$;

grant execute on function public.search_providers(text, uuid, int, int) to anon, authenticated;
