---
applyTo: "**"
description: "Antipatterns to never introduce — concrete before/after examples"
---

# Antipatterns — El Contactico

Concrete patterns to **never** introduce. Each entry shows the ❌ wrong pattern and the ✅ correct pattern. Use as a checklist during code review.

See also: `architecture.md` (rationale), `astro.md` (quick rules), `supabase.md` (DB rules), `performance.md` (speed rules).

---

## 1. `<script is:inline>` for non-trivial logic

`is:inline` opts out of Astro bundling: no TypeScript, no minification, duplicated per instance, **and does not re-execute on View Transitions** (this project uses `<ClientRouter />` site-wide). Use it ONLY for critical theme snippets that must run before paint, or for tiny third-party analytics already minified.

❌ Wrong:
```astro
<script is:inline>
  document.querySelector('[data-thing]').addEventListener('click', () => { ... })
</script>
```

✅ Right — bundled `<script>` + custom element with `data-*` attributes:
```astro
<my-thing data-options={JSON.stringify(opts)}>
  <button data-trigger>Click</button>
</my-thing>

<script>
  class MyThing extends HTMLElement {
    connectedCallback() {
      const opts = JSON.parse(this.dataset.options ?? '[]')
      this.querySelector('[data-trigger]')?.addEventListener('click', () => { /* ... */ })
    }
  }
  if (!customElements.get('my-thing')) customElements.define('my-thing', MyThing)
</script>
```

Reference implementation: `src/components/directory/ProviderRegistrationForm.astro` (`<district-autocomplete>`), `src/components/ui/ChipSelect.astro` (`<chip-select>`).

---

## 2. `select('*')` in queries

Defeats column-level type narrowing, ships unused bytes over the wire, and breaks when columns are added/removed.

❌ Wrong:
```ts
const { data } = await supabase.from('providers').select('*').eq('district_id', id)
```

✅ Right — list every column you actually use:
```ts
const { data } = await supabase
  .from('providers')
  .select('id, name, phone, whatsapp, photo_url, accepts_sinpe, response_time_minutes')
  .eq('district_id', id)
  .eq('verified', true)
```

---

## 3. Inline Supabase queries in `.astro` frontmatter

Frontmatter is for imports and presentation glue. Business logic in `.astro` files is not testable, not reusable, and bypasses our error-logging convention.

❌ Wrong:
```astro
---
import { supabase } from '@lib/supabase'
const { data } = await supabase.from('providers').select('id, name').eq('verified', true)
---
```

✅ Right — push to `@lib/queries/<domain>.ts`:
```astro
---
import { getVerifiedProviders } from '@lib/queries/providers'
const providers = await getVerifiedProviders()
---
```

---

## 4. Hardcoded canton / district / category IDs

Breaks multi-district readiness (the project must support every canton in CR from day one — see `multi-district.md`).

❌ Wrong:
```ts
const districtId = '00000000-0000-4000-8000-000000000001'
const { data } = await supabase.from('providers').select(...).eq('district_id', districtId)
```

✅ Right — derive the ID from the URL slug:
```ts
const district = await getDistrictBySlugs(cantonSlug, districtSlug)
if (!district) return Astro.redirect('/404')
const providers = await getProvidersByDistrictId(district.id)
```

---

## 5. `console.log` in production code

We have `@lib/logger` precisely so logs are silent in prod and visible in dev. Stray `console.log` clutters runtime output and can leak data in error monitoring.

❌ Wrong: `console.log('district', district)`
✅ Right: `logger.debug('resolved district', { slug, id: district.id })`

Exception: scripts under `scripts/` may use `console` — they're build-time tools.

---

## 6. Direct `fetch()` to Supabase URLs

Defeats RLS-aware client behavior, kills typing, and bypasses session refresh. Always use `@lib/supabase`.

❌ Wrong:
```ts
const res = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/rest/v1/providers`, { headers: { ... } })
```

✅ Right:
```ts
import { supabase } from '@lib/supabase'
const { data, error } = await supabase.from('providers').select('id, name').eq('district_id', id)
```

---

## 7. `../../../` import chains

Use path aliases. They survive file moves, render cleanly in IDE search, and are mandated by `tsconfig.json`.

❌ Wrong: `import Button from '../../../components/ui/Button.astro'`
✅ Right: `import Button from '@components/ui/Button.astro'`

Aliases: `@components/*`, `@layouts/*`, `@lib/*`, `@types/*`, `@actions/*`.

---

## 8. Bare `<img>` instead of `<Image>` from `astro:assets`

`<img>` ships unoptimized assets (no AVIF/WebP fallback, no responsive sizes, no lazy default). For remote images, `<Image>` requires `width`/`height` so the browser reserves space (no CLS).

❌ Wrong: `<img src={provider.photo_url} alt={provider.name} />`
✅ Right:
```astro
---
import { Image } from 'astro:assets'
---
<Image src={provider.photo_url} alt={provider.name} width={400} height={400} loading="lazy" />
```

The Supabase Storage host is allowlisted in `astro.config.mjs` under `image.domains`.

---

## 9. `innerHTML` with server-controlled data

Even when data is "trusted", string concatenation into `innerHTML` is an XSS landmine the day someone changes the source. Use `textContent` + `createElement`.

❌ Wrong:
```ts
li.innerHTML = '<span class="name">' + opt.name + '</span>'
```

✅ Right:
```ts
const span = document.createElement('span')
span.className = 'name'
span.textContent = opt.name
li.appendChild(span)
```

---

## 10. N+1 queries inside `.map()`

A separate query per row blows up at scale. Batch with `.in('id', [...ids])` and assemble the result with a `Map`.

❌ Wrong:
```ts
const providers = await getProvidersByDistrict(id)
for (const p of providers) {
  const reviews = await getReviewsByProviderId(p.id) // 1 query per provider
}
```

✅ Right:
```ts
const providers = await getProvidersByDistrict(id)
const summaries = await getReviewSummariesByProviderIds(providers.map((p) => p.id)) // single query
// summaries is a Map<providerId, { rating, reviewCount }>
```

Reference implementation: `src/lib/queries/reviews.ts`.

---

## 11. Mutations via API routes

API routes (`src/pages/api/*`) are reserved for external webhooks (Stripe, etc.). Frontend-driven mutations go through Astro Actions — Zod-validated, type-inferred end-to-end, standardized error handling.

❌ Wrong: `POST /api/register-provider` with manual `request.formData()` parsing.
✅ Right: `actions.registerProvider` defined in `src/actions/index.ts` with Zod schema, called via `<form action={actions.registerProvider}>`.

---

## 12. Sequential `await` for independent queries

If two queries don't depend on each other, run them in parallel. Sequential awaits double the page TTFB for no reason.

❌ Wrong:
```ts
const district = await getDistrictBySlugs(cs, ds)
const category = await getCategoryBySlug(cgs)
const providers = await getProvidersByDistrictAndCategory(cs, ds, cgs)
```

✅ Right:
```ts
const [district, category, providers] = await Promise.all([
  getDistrictBySlugs(cs, ds),
  getCategoryBySlug(cgs),
  getProvidersByDistrictAndCategory(cs, ds, cgs),
])
```

Reference: `src/pages/[canton]/[distrito]/[categoria].astro`.

---

## 13. `getStaticPaths` without thin-content filter

A page with zero or one provider is not a directory page — it dilutes SEO, fails the helpful-content rubric, and wastes build time.

❌ Wrong:
```ts
export async function getStaticPaths() {
  const districts = await getAllDistricts()
  const categories = await getAllCategories()
  return districts.flatMap((d) => categories.map((c) => ({ params: { distrito: d.slug, categoria: c.slug } })))
}
```

✅ Right — only emit combinations with ≥1 verified provider:
```ts
export async function getStaticPaths() {
  return await getListingStaticPaths() // returns only slugs with provider_count > 0
}
```

---

## 14. Service role key in any `PUBLIC_*` variable or in frontend code

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. If it leaks to the client, the entire DB is compromised. It belongs in Vercel env (server-only) and is loaded only inside Edge Functions or admin scripts.

❌ Wrong:
- `PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...` (any `PUBLIC_*` is shipped to the browser)
- `import.meta.env.SUPABASE_SERVICE_ROLE_KEY` inside `.astro` or `src/components/*`

✅ Right: only referenced in `src/actions/` server handlers or `scripts/` tools, behind a runtime check that we're on the server.

---

## 15. `ViewTransitions` import (Astro 5 name)

The component was renamed to `<ClientRouter />` in Astro 6 and the old import was removed. We're on Astro 6.

❌ Wrong: `import { ViewTransitions } from 'astro:transitions'`
✅ Right: `import { ClientRouter } from 'astro:transitions'`

---

## When something feels like it belongs here

If the same mistake gets reverted in code review more than twice, add it as a numbered entry above with a real-from-the-repo before/after. The `code-reviewer` agent reads this file.
