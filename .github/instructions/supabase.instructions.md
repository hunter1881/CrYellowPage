---
applyTo: "src/lib/**,src/actions/**"
---

# Supabase rules for DirectorioLocal CR

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
- Use `.maybeSingle()` for optional lookups (returns `null` instead of throwing)
- Use `.single()` only when the row is guaranteed to exist
- Use `!inner` modifier on embedded relations when filtering the parent by them

## RLS (Row Level Security)
- Enabled on every table without exception
- `providers`: public read when `verified = true`; insert/update only by `auth.uid() = owner_id`
- `reviews`: public read; insert only by authenticated users with `auth.uid() = author_id`
- `categories`, `cantons`, `districts`: public read, no public write

### RLS policy templates
```sql
-- providers: public read for verified
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers_public_read" ON providers
  FOR SELECT USING (verified = true);

-- providers: owner can read their own unverified row
CREATE POLICY "providers_owner_read_unverified" ON providers
  FOR SELECT USING (auth.uid() = owner_id);

-- providers: insert only own rows
CREATE POLICY "providers_self_insert" ON providers
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- providers: update only own rows
CREATE POLICY "providers_owner_update" ON providers
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- reviews: public read, authenticated insert
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_authenticated_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = author_id);
```

## Image storage
- Bucket: `provider-photos` (public)
- Path: `{provider_id}/{filename}`
- Upload via Astro Action handler (not from client) to validate ownership before writing
- Public URL: `${SUPABASE_URL}/storage/v1/object/public/provider-photos/{path}`
- Allowlist the host in `astro.config.mjs` under `image.domains`

## Environment variables
- `PUBLIC_SUPABASE_URL` — safe to expose, in `.env` and Vercel
- `PUBLIC_SUPABASE_ANON_KEY` — safe to expose, RLS enforces; in `.env` and Vercel
- `SUPABASE_SERVICE_ROLE_KEY` — Vercel only, NEVER `PUBLIC_*`, NEVER committed

## Never
- Expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or `PUBLIC_*` vars
- Run unfiltered queries (no WHERE clause)
- Store sensitive data without RLS enabled
- Mock the Supabase client in tests — use a local Supabase instance
- Use `service_role` to bypass RLS — fix the RLS policy instead
