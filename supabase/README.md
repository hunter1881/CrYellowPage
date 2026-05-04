# Supabase Setup

## Source Data

The geography seed is generated from `supabase/sources/inec-uged-2024.dbf`, extracted from INEC's official **Unidad Geoestadística Distrital 2024** download.

The generator validates the seed before writing SQL:

- 7 provinces
- 84 cantons
- 492 districts

Run:

```bash
npm run db:seed:generate
```

This writes `supabase/seed.sql` with:

- country, provinces, cantons, districts
- official district/postal codes
- area in square meters
- INEC source update date per district
- starter categories
- demo providers and reviews for Vuelta de Jorco

## Apply Order

1. Apply `supabase/migrations/20260504113000_initial_directory_schema.sql`.
2. Run `supabase/seed.sql`.
3. Generate TypeScript types with `npm run db:types`.

`SUPABASE_SERVICE_ROLE_KEY` must stay server-only and must not be exposed through `PUBLIC_*`.
