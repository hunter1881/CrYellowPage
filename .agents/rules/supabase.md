# Supabase rules for this project

Applies to: `src/lib/`, `src/actions/`, any DB query. See `architecture.md` sections 3-5 for full rationale.

## Type-safe client (mandatory)
- Generate types whenever the schema changes:
  ```bash
  npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
  ```
- Wired as `npm run db:types`
- Always use `createClient<Database>()` — never the untyped form
- Never hand-edit `src/types/database.types.ts`

## Queries
- Use the singleton from `@lib/supabase`
- All query functions live in `@lib/queries/<domain>.ts` — never inline in `.astro` files
- List columns explicitly — never `select('*')`
- Always destructure `{ data, error }` and handle errors via `@lib/logger`
- Always include `.eq('district_id', id)` as a minimum filter on `providers`
- Use `.maybeSingle()` for optional lookups (returns `null` instead of throwing) and `.single()` only when the row is guaranteed
- Use `!inner` modifier on embedded relations when you need to filter the parent by them

## RLS (Row Level Security)
- Enabled on every table without exception
- `providers`: public read when `verified = true`; insert/update only by `auth.uid() = owner_id`
- `reviews`: public read; insert only by authenticated users with `auth.uid() = author_id`
- `categories`, `cantons`, `districts`: public read, no public write
- See `db-architect.md` for the full policy SQL

## Image storage
- Bucket: `provider-photos` (public)
- Path: `{provider_id}/{filename}`
- Upload via Astro Action handler (not from client) so the action can validate ownership before writing
- Public URL: `${SUPABASE_URL}/storage/v1/object/public/provider-photos/{path}`
- Allowlist the host in `astro.config.mjs` under `image.domains` for `<Image>` optimization

## Environment variables
- `PUBLIC_SUPABASE_URL` — safe to expose, in `.env` and Vercel
- `PUBLIC_SUPABASE_ANON_KEY` — safe to expose, RLS enforces; in `.env` and Vercel
- `SUPABASE_SERVICE_ROLE_KEY` — Vercel only, NEVER `PUBLIC_*`, NEVER committed
- All vars typed in `src/env.d.ts` for IntelliSense

## Never
- Expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or `PUBLIC_*` vars
- Run unfiltered queries (no WHERE clause)
- Store sensitive data without RLS enabled
- Mock the Supabase client in tests — use a local Supabase instance against a real DB
- Use `service_role` to bypass RLS — fix the RLS policy instead
