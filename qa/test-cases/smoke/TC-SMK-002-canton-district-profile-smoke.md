---
id: TC-SMK-002
title: Canton landing, district landing, and provider profile pages render correctly
priority: P0
type: smoke
tags: [canton, district, profile, indexable, seo, ssg]
preconditions:
  - dev server running on http://localhost:4321
  - DB seeded with at least one canton, district, and verified provider (Aserrí / Vuelta de Jorco / "Don Rafa Fontanería")
created: 2026-05-05
last_run: 2026-05-05T16:30:00-06:00
last_status: pass
related_files:
  - src/pages/[canton]/index.astro
  - src/pages/[canton]/[distrito]/index.astro
  - src/pages/proveedor/[id].astro
  - src/lib/queries/categories.ts
  - src/lib/queries/geography.ts
  - src/lib/queries/providers.ts
  - src/lib/seo/place.ts
  - src/lib/seo/breadcrumb.ts
related_bugs: []
---

## Objective

Walk all three pre-rendered page types (canton landing, district landing, provider profile) and verify each one returns 200, has correct SEO metadata, the right JSON-LD schema, single H1, clean console, and no broken assets. These three pages are the SEO funnel beyond the home page — a regression here is invisible until users hit a 404 from a search engine.

## Sub-test A — Canton landing (`/aserri/`)

### Steps
1. Navigate to `http://localhost:4321/aserri/`
2. Wait for `astro:page-load` (use `mcp__playwright__browser_wait_for` on a stable selector, e.g., `h1`)
3. Take ARIA snapshot via `mcp__playwright__browser_snapshot`
4. Capture network log via `mcp__playwright__browser_network_requests`
5. Capture console messages via `mcp__playwright__browser_console_messages`
6. Read metadata via `mcp__playwright__browser_evaluate`:
   ```js
   ({
     title: document.title,
     description: document.querySelector('meta[name="description"]')?.content,
     canonical: document.querySelector('link[rel="canonical"]')?.href,
     h1Count: document.querySelectorAll('h1').length,
     h1Text: document.querySelector('h1')?.textContent?.trim(),
     jsonLd: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => JSON.parse(s.textContent ?? '{}'))
   })
   ```
7. Take screenshot (`canton-landing.png`)

### Expected
- HTTP 200, no redirect
- `<title>` mentions "Aserrí" and "DirectorioLocal", < 60 chars
- `<meta name="description">` present, 50–160 chars, mentions Aserrí
- `<link rel="canonical">` equals `http://localhost:4321/aserri/` (or production domain on preview)
- Exactly one `<h1>`; text contains "Aserrí"
- JSON-LD includes a `Place` schema with `name: "Aserrí"` and a `BreadcrumbList`
- StatsStrip visible with 4 cells (verified providers, districts, active categories, canton name)
- District list visible, every card links to `/aserri/{distrito}/`
- Console: 0 errors, 0 hydration warnings
- Network: no 4xx or 5xx on document or any subresource

## Sub-test B — District landing (`/aserri/vuelta-de-jorco/`)

### Steps
8. Navigate to `http://localhost:4321/aserri/vuelta-de-jorco/`
9. Repeat steps 2–6 from Sub-test A (snapshot, network, console, metadata)
10. Additionally read: every category card's `count` attribute or visible text via:
    ```js
    Array.from(document.querySelectorAll('[data-category-card], a[href*="/aserri/vuelta-de-jorco/"]')).map((el) => ({
      href: el.getAttribute('href'),
      text: el.textContent?.trim()
    }))
    ```
11. Take screenshot (`district-landing.png`)

### Expected
- HTTP 200
- `<title>` mentions "Vuelta de Jorco" and "Aserrí"
- `<meta name="description">` mentions both names
- `<link rel="canonical">` equals the page URL
- Exactly one `<h1>`; text contains "Vuelta de Jorco"
- JSON-LD includes `Place` (district) and `BreadcrumbList` with breadcrumbs Inicio › Aserrí › Vuelta de Jorco
- Breadcrumbs visible in DOM matching the JSON-LD trail
- StatsStrip visible with 4 cells (providers, available categories, district, canton)
- Category grid visible — each tile shows an emoji icon, category name, count, and links to `/aserri/vuelta-de-jorco/{categoria}` (note: NO trailing slash on category listings; verify this matches `astro.config.mjs` `trailingSlash` setting)
- **Category counts > 0** for every visible card. If any card shows "0 categorías" or count = 0, this is a bug — failed regression of `getCategoryCountsByDistrictIds`.
- Console: clean
- Network: clean

## Sub-test C — Provider profile (`/proveedor/00000000-0000-4000-8000-000000000301-don-rafa-fontaneria`)

### Steps
12. Navigate to the URL above (Don Rafa from the seed)
13. Repeat steps 2–6 from Sub-test A
14. Read the contact buttons via:
    ```js
    ({
      whatsapp: document.querySelector('a[href*="wa.me"]')?.getAttribute('href'),
      tel: document.querySelector('a[href^="tel:"]')?.getAttribute('href')
    })
    ```
15. Take screenshot (`provider-profile.png`)

### Expected
- HTTP 200
- `<title>` mentions provider name "Don Rafa Fontanería"
- `<meta name="description">` includes provider name and at least one keyword from the description
- `<link rel="canonical">` equals the canonical UUID-based URL
- Exactly one `<h1>`; text contains "Don Rafa Fontanería"
- JSON-LD includes `LocalBusiness` schema with required fields:
  - `name`
  - `telephone` (E.164 format with +506 country code)
  - `address` of type `PostalAddress` with `addressCountry: "CR"`, `addressRegion`, `addressLocality`
  - `areaServed` array with at least the district name
  - `image` (from `photo_url` or default avatar)
  - `url` matching canonical
  - `description`
- WhatsApp link is `https://wa.me/506{number}` format
- Phone link is `tel:+506{number}` format
- Both links open in new tab (`target="_blank"` with `rel="noopener"`)
- Reviews section visible (may be a Server Island; wait for `astro:page-load` complete)
- Sticky mobile contact bar appears on viewport widths ≤ 768px (test by resizing viewport via `mcp__playwright__browser_resize` to 390×844 and re-checking)
- Console: clean
- Network: clean

## Cross-cutting checks (apply to all 3 sub-tests)

For each page, after the sub-test:

- No bare `<img>` tags — all images via `<picture>` from astro:assets (grep the rendered HTML for `<img>` and verify each is inside a `<picture>` element with a `source` sibling)
- No `console.log` output from production code (only project-internal logs from `@lib/logger` are allowed in dev mode; "[vite]" hot-reload messages are tolerated)
- No service-role-key string in the rendered HTML or any inline `<script>` (search for `service_role`, `service-role`, `eyJ` JWT prefix)
- No bundle includes the string "ViewTransitions" — that's the Astro 5 name; we're on Astro 6 with `ClientRouter`

## Negative path — non-existent slugs (run separately at the end)

16. Navigate to `http://localhost:4321/canton-que-no-existe/` → expect HTTP 404
17. Navigate to `http://localhost:4321/aserri/distrito-que-no-existe/` → expect HTTP 404
18. Navigate to `http://localhost:4321/proveedor/no-existe/` → expect HTTP 404 OR redirect to /404

## Notes

- All three page types are pre-rendered (`prerender = true` + `getStaticPaths`). If any sub-test reports cold-start latency > 200ms in the Network panel response time for the document, the page may have silently fallen back to SSR — flag and investigate.
- This test takes ~20 seconds end-to-end. If it exceeds 60 seconds, something is wrong (probably a Server Island that's blocking the navigation event).
- This is a smoke test; the full E2E user journey is in TC-FLW-001 — they overlap intentionally on canton+district+profile, but TC-FLW-001 also exercises filters, sort, and outbound contact taps. Don't merge them: smoke must be fast and read-only.

## Test data created

None — this test is read-only.
