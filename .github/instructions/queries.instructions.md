---
applyTo: "src/lib/queries/**,src/actions/**,src/lib/supabase.ts"
description: "Concrete Supabase query rules — selects, filters, batching, RLS, pagination"
---

# Query rules — El Contactico

Concrete rules for writing Supabase queries. Every query in this codebase must satisfy all of them.

See also: `supabase.md` (high-level), `antipatterns.md` (§2, §3, §10, §12), `performance.md` (§3, §4), `.claude/skills/supabase-postgres-best-practices/` (Postgres-level optimization).

---

## 1. Where queries live

- **Always in `src/lib/queries/<domain>.ts`** — one file per domain (`providers.ts`, `categories.ts`, `geography.ts`, `reviews.ts`, `paymentMethods.ts`).
- **Never in `.astro` frontmatter, components, or actions handlers** — actions call query functions, they don't write SQL.
- **Each function has a typed return** (`Promise<Provider[]>`, `Promise<Provider | null>`, `Promise<Map<string, ReviewSummary>>`).

---

## 2. Always use the typed singleton client

```ts
import { supabase } from '@lib/supabase'
```

The singleton is `createClient<Database>(...)` — generic typed against `src/types/database.types.ts`. Don't instantiate `createClient` again. Don't use `fetch()` against Supabase URLs.

Regenerate types after any schema change: `npm run db:types`.

---

## 3. Column selection

- **List every column you need**. Never `select('*')`.
- **Group related columns on one line** for readability:
  ```ts
  .select('id, name, phone, whatsapp, email, photo_url, description, district_id, accepts_sinpe, works_weekends, response_time_minutes, years_active, completed_jobs, verified, created_at')
  ```
- **For relations, use the embedded form** with explicit columns:
  ```ts
  .select('id, name, provider_categories!inner(category_id)')
  ```
- **`!inner` modifier** when you need to filter the parent by the child relation. Without it, the join is a left-join and the parent row is returned even when the child is missing.

---

## 4. Filters — required minimums

Every `providers` query **must** include `.eq('district_id', id)` at minimum. This is a hard rule from `architecture.md` §5.

For listings shown to the public, also `.eq('verified', true)`.

For owner-side queries (account dashboard, edit profile), also `.eq('owner_id', userId)`.

---

## 5. Single-row lookups

- **`.maybeSingle()`** when "not found" is a legitimate state — returns `null`, no throw. Use for slug→record resolutions:
  ```ts
  const { data: district } = await supabase
    .from('districts')
    .select('id, name, canton:cantons(id, name, slug)')
    .eq('slug', districtSlug)
    .maybeSingle()
  ```
- **`.single()`** only when the row is guaranteed by a prior check (e.g. user auth → profile that must exist). Throws on miss; fails loud.
- **Never `.limit(1)` + `data[0]`** — that's the old pattern, less expressive and fails silent.

---

## 6. Error handling

Always destructure both `data` and `error`. Errors fail loud, not silent.

```ts
const { data, error } = await supabase.from('providers').select('id, name').eq('district_id', id)
if (error) {
  logger.error('getProvidersByDistrict', { districtId: id, error })
  return []
}
return data ?? []
```

- **Return `[]` or `null`** only when "not found" is legitimate.
- **Never swallow errors** to suppress logs. Log them, then return the fallback.
- **Use `@lib/logger`** — never `console.error` in production code.

---

## 7. Batching — never N+1

If you need data for a list of IDs, fetch once with `.in('id', [...ids])` and assemble a `Map`. See `antipatterns.md` §10.

```ts
export async function getReviewSummariesByProviderIds(
  ids: string[]
): Promise<Map<string, { rating: number; reviewCount: number }>> {
  if (ids.length === 0) return new Map()
  const { data, error } = await supabase
    .from('review_summaries')
    .select('provider_id, rating, review_count')
    .in('provider_id', ids)
  if (error) {
    logger.error('getReviewSummariesByProviderIds', { error })
    return new Map()
  }
  return new Map(data.map((row) => [row.provider_id, { rating: Number(row.rating), reviewCount: row.review_count }]))
}
```

---

## 8. Parallelism

Run independent queries in parallel with `Promise.all`. Sequential `await`s are an antipattern when there are no dependencies. See `antipatterns.md` §12.

---

## 9. Indexes (canonical list)

These exist in the schema. **Don't write a query that scans without one of these on its filter column.**

```sql
CREATE INDEX idx_providers_district ON providers(district_id);
CREATE INDEX idx_providers_verified ON providers(verified) WHERE verified = true;
CREATE INDEX idx_provider_categories_category ON provider_categories(category_id);
CREATE INDEX idx_districts_canton ON districts(canton_id);
CREATE INDEX idx_districts_slug ON districts(slug);
CREATE INDEX idx_cantons_slug ON cantons(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
```

If a new query needs to filter on a column without an index, **add the index in the same migration** as the query. Don't wait for it to become slow.

For composite filters (`district_id` + `verified` + sort), see the Supabase Postgres best-practices skill: `query-composite-indexes.md`.

---

## 10. Pagination

- **Don't paginate** for districts/categories — they fit in one query.
- **Do paginate** providers if a single district could exceed ~50 verified rows. Use **keyset pagination**, not OFFSET, to stay O(1) at scale:
  ```ts
  .order('created_at', { ascending: false })
  .order('id', { ascending: false })
  .lt('created_at', cursor.createdAt) // or composite using (created_at, id)
  .limit(20)
  ```

See `query-pagination.md` in the Supabase best-practices skill.

---

## 11. RLS — write-side rules

The frontend never bypasses RLS. The action handler is the boundary.

- **Inserts**: include `owner_id: auth.uid()` — RLS policy `providers_self_insert` enforces it.
- **Updates**: filter by `owner_id` AND let RLS double-check; never trust the form.
- **Verified flag**: providers can never flip their own `verified`. Policy `providers_owner_update` includes a `WITH CHECK` that the new row's `verified` equals the current row's.

---

## 12. Service role usage

Service role bypasses RLS. Use it ONLY in:
- `scripts/` (build-time admin tools)
- `src/actions/` server handlers that need to read across users (e.g., admin dashboards) — and only behind an `auth.uid()` admin check

Never import `SUPABASE_SERVICE_ROLE_KEY` in `.astro`, `src/components/*`, or `src/lib/*`. The singleton client in `@lib/supabase` uses the anon key by design.

---

## 13. View patterns

For complex aggregates (provider rating, completed jobs over time), use a Postgres view or materialized view rather than client-side aggregation. The existing `review_summaries` view is the canonical example.

```sql
CREATE VIEW review_summaries AS
SELECT
  provider_id,
  AVG(rating) AS rating,
  COUNT(*) AS review_count
FROM reviews
GROUP BY provider_id;
```

Then query the view exactly like a table — no JOIN cost, no client aggregation.

---

## Pre-PR query checklist

- [ ] Lives in `src/lib/queries/<domain>.ts`
- [ ] Uses the typed `@lib/supabase` singleton
- [ ] Lists explicit columns (no `*`)
- [ ] Includes `district_id` filter on `providers` queries
- [ ] Destructures `{ data, error }` and logs errors via `@lib/logger`
- [ ] Uses `.maybeSingle()` / `.single()` per §5
- [ ] No N+1 — batched with `.in()` if iterating a list
- [ ] Independent queries run in parallel via `Promise.all`
- [ ] Filter columns are indexed (or new index added in the same migration)
- [ ] Pagination uses keyset, not OFFSET, when applicable
- [ ] Returns a typed `Promise<...>`
