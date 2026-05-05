---
id: TC-RGR-001
title: Category listing pre-renders for combinations with ≥1 verified provider (no 404 on internal links)
priority: P0
type: regression
tags: [seo, getStaticPaths, internal-links, prerender]
preconditions:
  - dev server running on http://localhost:4321
  - DB has the seed data: Vuelta de Jorco district with category "reparaciones" having 2 verified providers
created: 2026-05-05
last_run: null
last_status: new
related_files:
  - src/pages/[canton]/[distrito]/[categoria].astro
  - src/lib/queries/providers.ts
  - .claude/rules/architecture.md
  - supabase/migrations/20260505120000_listing_combinations_rpc.sql
related_bugs:
  - 'Internal link from district grid to /aserri/vuelta-de-jorco/reparaciones returned 404 because getListingStaticPaths used min_providers=3 but the district grid showed categories with ≥1 provider'
---

## Objective

Codify the bug fix for the threshold-mismatch issue: the district landing grid linked to category listings, but those listings only got pre-rendered if they had ≥3 providers. Categories with 1–2 providers got 404 on click. This regression test ensures **every internally-linked category listing is reachable** and **categories that legitimately have zero verified providers still 404** (anti-thin-content).

## Steps

### Phase A — Reachability (every link from district must work)
1. Navigate to `/aserri/vuelta-de-jorco/`
2. Snapshot the district page
3. Extract every `<a href>` in the category grid (use `mcp__playwright__browser_evaluate`):
   ```js
   () => Array.from(document.querySelectorAll('main a[href]'))
     .map((a) => a.getAttribute('href'))
     .filter((h) => /^\/[^/]+\/[^/]+\/[^/]+\/?$/.test(h))
   ```
4. For each href, navigate to it
5. Verify HTTP 200 (NOT 404)
6. Verify the page has `<h1>` and at least one ProviderCard
7. Capture screenshot per URL

### Phase B — Anti-thin-content (zero-provider combos must 404)
8. Pick a (canton, district, category) tuple where the DB has 0 verified providers — query Supabase directly to find one
9. Navigate to `/{canton}/{distrito}/{categoria}/`
10. Verify HTTP 404 (status, not soft 404 with EmptyState)

### Phase C — Specific historic case (the original bug)
11. Navigate to `/aserri/vuelta-de-jorco/reparaciones`
12. Verify HTTP 200
13. Verify at least 2 ProviderCards render (Don Rafa Fontanería + Servicios Jorco from the seed)
14. Verify the page is genuinely pre-rendered (not SSR'd at request time):
    - Open DevTools → Network → main document
    - Response headers include `x-vercel-cache: HIT` (in Vercel) OR for local dev, the page response time should be <100ms (no DB hit at request time)
    - Alternative check: in the build output `dist/`, the file `aserri/vuelta-de-jorco/reparaciones/index.html` exists

## Expected result

- Phase A: every internal link from the district grid resolves to a 200 with a working listing.
- Phase B: a category without any verified provider in that district returns a hard 404.
- Phase C: `/aserri/vuelta-de-jorco/reparaciones` returns 200 with ≥2 ProviderCards and is statically pre-rendered.

## Notes

This test guards against three regressions:
1. Someone bumps `min_providers` back to 3 in `getListingStaticPaths()` without re-thresholding the district grid → Phase A fails.
2. Someone removes the `min_providers: 1` filter entirely (allowing zero-provider pages) → Phase B fails.
3. Someone removes `export const prerender = true` or `export async function getStaticPaths()` from `[categoria].astro` → Phase C fails (page becomes SSR).

The architecture rule lives at `.claude/rules/architecture.md` § "Anti-thin-content" — both must stay in sync.

If this test fails after a change to `[categoria].astro` or `getListingStaticPaths`, do NOT just lower the threshold or skip the test. Read the bug context above first.
