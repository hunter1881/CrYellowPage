---
id: TC-FLW-001
title: Browse funnel — home → canton → district → category → provider profile
priority: P0
type: flow
tags: [seo, navigation, journey, indexable]
preconditions:
  - dev server running on http://localhost:4321
  - DB seeded with Aserrí canton, Vuelta de Jorco district, fontaneria category, ≥1 verified provider
created: 2026-05-05
last_run: null
last_status: new
related_files:
  - src/pages/index.astro
  - src/pages/[canton]/index.astro
  - src/pages/[canton]/[distrito]/index.astro
  - src/pages/[canton]/[distrito]/[categoria].astro
  - src/pages/proveedor/[id].astro
related_bugs: []
---

## Objective

Walk the entire SEO funnel end-to-end as a real user would: search engine drops them on the home page, they pick a canton, then a district, then a category, then a provider profile, and finally tap WhatsApp/phone. At every step verify the page renders correctly, breadcrumbs are right, JSON-LD validates, and links go where they should.

This is the **money path**. If any step breaks, conversions die.

## Steps

### Step 1 — Home page
1. Navigate to `/`
2. Snapshot, screenshot
3. Find the canton list (Navbar dropdown or hero canton picker)
4. Verify: every listed canton has a real anchor `<a href="/{slug}/">` with kebab-case slug

### Step 2 — Canton landing
5. Click the first canton link (e.g., `/aserri/`)
6. Wait for `astro:page-load`
7. Snapshot, screenshot
8. Verify breadcrumbs: Inicio › Aserrí (with Aserrí text not linked or linked to itself)
9. Verify `<h1>` contains "Aserrí"
10. Verify JSON-LD includes `Place` + `BreadcrumbList`
11. Verify district list is rendered with at least one card showing `categoryCount > 0`
12. Verify each district card links to `/{canton}/{distrito}/`
13. Verify the StatsStrip shows `Proveedores verificados`, `Distritos`, `Categorías activas`, `Cantón` labels (Spanish, from `t()`)

### Step 3 — District landing
14. Click the first district card (e.g., `/aserri/vuelta-de-jorco/`)
15. Wait for `astro:page-load`
16. Snapshot, screenshot
17. Verify breadcrumbs: Inicio › Aserrí › Vuelta de Jorco
18. Verify `<h1>` contains district name
19. Verify category grid shows categories with `count > 0`
20. Verify each category link points to `/{canton}/{distrito}/{categoria}` (NOT `/{canton}/{distrito}/{categoria}/` with trailing slash unless that's the project convention — check `astro.config.mjs` `trailingSlash`)

### Step 4 — Category listing
21. Click the first category (e.g., `/aserri/vuelta-de-jorco/fontaneria`)
22. Wait for `astro:page-load`
23. Snapshot, screenshot
24. Verify breadcrumbs: Inicio › Aserrí › Vuelta de Jorco › Fontaneria
25. Verify `<h1>` contains "Fontaneria en Vuelta de Jorco"
26. Verify at least one ProviderCard renders
27. Verify each ProviderCard has: photo (or default avatar), name, rating if reviews exist, WhatsApp button, phone button
28. Verify the FilterPanel is visible with filters: SINPE, fines de semana, sort options
29. Verify JSON-LD includes `ItemList` with one entry per provider, plus `BreadcrumbList`
30. Activate the SINPE filter → URL gets `?sinpe=1`, providers list updates (server-side via link, not JS), no console errors
31. Deactivate the filter → URL `?sinpe=` removed
32. Click "Más recientes" sort → URL gets `?sort=newest`, providers re-order

### Step 5 — Provider profile
33. Click the first ProviderCard
34. Wait for `astro:page-load`
35. URL pattern: `/proveedor/{uuid}-{name-slug}`
36. Snapshot, screenshot
37. Verify breadcrumbs include canton + district + provider name
38. Verify `<h1>` contains provider name
39. Verify JSON-LD includes `LocalBusiness` with: `name`, `telephone`, `address` (PostalAddress with `addressCountry: 'CR'`), `areaServed` array, `geo` if known, `image`, `url`, `description`
40. Verify the WhatsApp link is `https://wa.me/506{number}` format
41. Verify the phone link is `tel:+506{number}` format
42. If reviews exist: verify they're rendered (could be Server Island — wait for it)
43. Verify the sticky-mobile-contact bar appears on viewport widths ≤ 768px

### Step 6 — Outbound contact (simulated)
44. Switch viewport to 390×844 (iPhone 14)
45. Click the sticky "Llamar" button → assert `tel:` href is correct (don't actually open dialer; just assert)
46. Click WhatsApp → assert `wa.me` href is correct
47. Verify: clicking these does NOT navigate the SPA (`target="_blank"` or `rel="noopener"`)

## Expected result

- Every page in the funnel returns 200, has correct meta + canonical + JSON-LD, single H1
- Breadcrumbs at each level match the URL hierarchy
- Internal links from listing → profile resolve to a 200 (not 404)
- Filters and sort produce GET-based URL changes (no client-side state lost on reload)
- LocalBusiness JSON-LD on provider profile validates against schema.org
- WhatsApp/phone links use international format with country code 506
- Console clean across the entire flow
- Network log: only same-origin and Supabase host; no leaked third-party requests
- Mobile sticky bar appears below 768px and disappears above

## Notes

- Use the **same browser context across steps** so cookies/state carry — this is a real user journey, not 6 isolated tests.
- Capture a screenshot at every step → store under `runs/<date>/TC-FLW-001/<step>.png`. The visual diff is part of the evidence.
- If any step 4xx/5xx, mark the whole flow `fail` and stop — the rest is meaningless once the funnel breaks.
- This test takes ~30s on a clean run. If runtime exceeds 60s, something is wrong (probably an unwanted retry or auto-wait on a slow Server Island).
