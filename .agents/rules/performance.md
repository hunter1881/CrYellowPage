# Performance rules — El Contactico

This is a hyperlocal directory. **Speed is a SEO ranking signal and a UX requirement** — Costa Ricans on patchy mobile networks must get the listing in <2s LCP. These rules turn "fast" into a default.

See also: `architecture.md` (Server Islands, ISR), `antipatterns.md` (anti-rules), `supabase.md` (DB rules).

---

## 1. Render strategy hierarchy

Pick the highest one that fits. Going down the list is allowed only when the layer above can't satisfy the requirement.

1. **SSG** — pre-rendered at build, no JS shipped. Default for every directory page.
2. **Server Islands (`server:defer`)** — page shell is static, dynamic chunk fetches at request time. Use for: review counts, "recently active providers", anything that changes faster than the build cycle.
3. **`output: 'server'` + `prerender = true`** — page-by-page opt-in to SSR for the rare page that genuinely needs request-time data.
4. **Alpine.js (`x-data`, `x-show`)** — for lightweight client-side interactivity. Already in the bundle, ~15 KB gzipped.
5. **Custom element + bundled `<script>`** — for component-scoped stateful UI (autocomplete, chip-select). One class per component, registered once.
6. **`<script is:inline>`** — last resort. Only for pre-paint critical scripts or third-party analytics.

❌ React/Vue/Svelte — not in the stack, never add.

---

## 2. Image rules (zero CLS, smallest bytes)

- **Always `<Image>` from `astro:assets`** — never bare `<img>`.
- **Remote images require `width` + `height`** — browser reserves the box, no layout shift.
- **`loading="lazy"` for everything below the fold**, `loading="eager"` for the hero only.
- **`fetchpriority="high"` on the LCP image** (typically the provider photo on profile pages).
- **Allowlist hosts** in `astro.config.mjs` under `image: { domains: [...] }`. Already done for Supabase Storage.
- **Don't upload originals**: provider photos uploaded via Astro Actions should be resized server-side before hitting Storage (target: 1200px max edge, 80% quality JPEG/WebP).

---

## 3. Build-time query batching

`getStaticPaths` and `.astro` frontmatter are the page's TTFB. Slow queries here = slow build = stale content.

- **Run independent queries in parallel** with `Promise.all`. Never chain `await`s when there's no dependency.
- **Skip empty combinations** in `getStaticPaths` (also satisfies anti-thin-content). Use `getListingStaticPaths()`.
- **Cache cross-page lookups** in module-scoped `Map`s when `getStaticPaths` runs many times per build (e.g. cantón → districts).

---

## 4. Runtime query rules

- **Never N+1 inside `.map()`**. Batch with `.in('id', [...])`. See `antipatterns.md` §10.
- **List columns explicitly** — never `select('*')`. Smaller payloads, smaller cache footprint.
- **Use embedded relations** for joins instead of separate queries: `select('id, name, provider_categories!inner(category_id)')`.
- **`.maybeSingle()`** when "not found" is legitimate (returns `null`); `.single()` only when the row is guaranteed (throws on miss — fails loud).
- **Composite indexes** for any filter+sort combo used on hot paths. See `supabase.md` for the index list.

---

## 5. JS bundle hygiene

- **Astro components by default** — they ship zero runtime JS unless explicitly hydrated.
- **Alpine for interactivity, not custom elements**, when state is purely UI (toggle, dropdown). Custom elements are for components with structured data.
- **One bundled `<script>` per component** — Astro deduplicates. Don't repeat the same logic in multiple files.
- **No npm packages for things the platform does**: `Date`, `Intl.NumberFormat`, `URLSearchParams`, `crypto.randomUUID()`. No `dayjs`/`moment`/`lodash`.
- **Keep total client JS under 50 KB gzipped** for directory pages. Profile pages may go up to 80 KB if the contact widget needs it.

---

## 6. CSS hygiene

- **Tailwind utilities only** in components — they're tree-shaken at build.
- **Component-scoped `<style>`** for one-off styles (Astro scopes by default).
- **Avoid `is:global`** unless reaching into a third-party widget you don't control.
- **`@apply` sparingly** in `global.css` for design tokens, not for full component styles.

---

## 7. Fonts

- Subset to `latin` + `latin-ext` only — no Cyrillic/CJK weight unless needed.
- `font-display: swap` on every `@font-face`.
- Preload only the **one** font weight used above the fold. Defer the rest.
- Self-host with `@fontsource/*` rather than Google Fonts CDN — eliminates the third-party DNS round-trip.

---

## 8. Caching & edge

- **`Cache-Control: public, max-age=31536000, immutable`** for hashed asset URLs (Astro emits these by default for `astro:assets`).
- **ISR via Vercel** when build time exceeds ~5 minutes — `adapter: vercel({ isr: { expiration: 3600 } })`. Phase 3 of the architecture migration.
- **Edge middleware** only for redirects and geo logic. Don't put query logic on the edge.

---

## 9. Third-party scripts

Every external `<script>` blocks the main thread. Default: **no third-party scripts**. If marketing demands one:
- Load with `is:inline` + `async` after `astro:page-load`.
- Use facade pattern (e.g. show a static placeholder, hydrate on user interaction).
- Move analytics to server-side via Vercel Analytics or Plausible-on-our-domain.

---

## 10. Performance budgets (enforced by `performance-auditor` agent)

| Metric | Target | Hard ceiling |
|---|---|---|
| LCP (mobile, 4G) | <1.8s | 2.5s |
| INP | <100ms | 200ms |
| CLS | <0.05 | 0.1 |
| Total page weight (HTML+CSS+JS) | <80 KB | 150 KB |
| Client JS (gzipped) | <50 KB | 80 KB |
| Static build time | <5 min | 10 min (then ISR) |

Run `npm run build` + Lighthouse on `/aserri/vuelta-de-jorco/fontaneria/` (representative listing) before any release.
