---
id: TC-SMK-001
title: Home page loads with hero, search, and recent providers
priority: P0
type: smoke
tags: [home, indexable, seo]
preconditions:
  - dev server running on http://localhost:4321
  - DB has at least 1 verified provider
created: 2026-05-05
last_run: null
last_status: new
related_files:
  - src/pages/index.astro
  - src/components/directory/SearchBar.astro
related_bugs: []
---

## Objective

Verify the home page renders with all critical sections for SEO and conversion: title, description, canonical, single H1, hero search input, navigation links, and at least one recent-provider card. The home page is the entry point for organic search traffic — any regression here is a release-blocker.

## Steps

1. **Navigate** to `http://localhost:4321/`
2. **Wait** for `astro:page-load` event (use `mcp__playwright__browser_navigate` with `wait_for: 'networkidle'`)
3. **Take aria snapshot** of `<body>` via `mcp__playwright__browser_snapshot`
4. **Capture network log** during nav via `mcp__chrome-devtools__list_network_requests` — confirm zero 4xx/5xx
5. **Read page metadata** by evaluating in the browser:
   - `document.title`
   - `document.querySelector('meta[name="description"]')?.content`
   - `document.querySelector('link[rel="canonical"]')?.href`
   - `document.querySelectorAll('h1').length`
   - All `<script type="application/ld+json">` parsed contents
6. **Take screenshot** for evidence (above-the-fold, 1920×1080)

## Expected result

- HTTP 200, no redirect
- `<title>` contains "DirectorioLocal" and is under 60 chars
- `<meta name="description">` present, between 50 and 160 chars
- `<link rel="canonical">` present, equals page URL
- Exactly **one** `<h1>` visible
- Hero search input exists with role `searchbox` or `textbox` and a Spanish-language placeholder
- At least one navigation link to a canton (`<a href="/{slug}/">` where slug is a real canton)
- Footer present with links to `/legal/terminos` and `/legal/privacidad`
- JSON-LD includes a `WebSite` schema with `potentialAction` of type `SearchAction`
- Console clean: zero errors, zero hydration warnings
- Network log: no 4xx or 5xx; no unexpected third-party requests

## Negative checks

- No service-role-key string in the HTML or JS bundle (`grep -i "service_role\|service-role"` against the rendered HTML and any inline scripts)
- No `console.log` output from production code
- No bare `<img>` tags (all images via `<picture>` from astro:assets)

## Notes

This is the canonical smoke test format. Future smoke tests should follow the same shape: navigate → snapshot → assert metadata → assert content → assert console/network clean → screenshot.

If this test fails, **stop the suite** and surface to the user — every other test depends on the home page working.
