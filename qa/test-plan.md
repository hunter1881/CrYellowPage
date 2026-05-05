# Master test plan — DirectorioLocal CR

This is the **coverage matrix**. The `qa-tester` agent reads this file before any run to know what's already covered, what's missing, and what's risky.

Update this file whenever a test case is added, deleted, or significantly changed.

---

## Risk register

Highest-risk areas first — these get P0 coverage and run on every smoke pass.

| Risk | Surface | Why it matters |
|---|---|---|
| Provider data not persisted after registration | `actions/registerProvider`, `providers` table, RLS | A registered provider that disappears is the worst possible UX |
| Wrong canton/district displayed for a provider | slug→ID resolution, JSON-LD `areaServed` | SEO + user-trust killer; Google indexes wrong locality |
| Listing page returns 404 when category exists | `getListingStaticPaths`, `min_providers` threshold | Dead internal links; we just fixed this — must not regress |
| Service role key leaked to client | `PUBLIC_*` env vars, frontend bundle | Full DB compromise |
| Search returns providers from wrong district | district filter param, query function | Wrong-locality results = directory loses purpose |
| Authenticated user sees another user's draft profile | RLS policy on `providers` | Privacy leak |
| Form double-submit creates duplicate provider | Astro Action idempotency | Data integrity |
| Mobile users can't tap CTA buttons | viewport, touch target size | Conversion blocker |
| LCP > 2.5s on listing pages on 4G | Image weight, render strategy, critical CSS | SEO + UX |
| Empty-state and zero-result pages indexable as thin content | `getStaticPaths` filter, `noindex` meta | SEO penalty |
| Client-side form validation bypassable via `form.requestSubmit()` | `ReviewForm.astro` Alpine `x-on:click` on `<button type="button">`, no `<form onsubmit>` guard | Server Zod catches it, but UX shows generic error with no field-level feedback. Affects review submission flow. Surfaced by qa-tester Mode F on 2026-05-05. |
| Zero-width space bypass of `.trim().min(3)` validation | `src/actions/index.ts` Zod schema for `businessName`/`contactName`/`description` | JS `.trim()` does not strip U+200B/ZWNJ/ZWJ; a name of 3 zero-width spaces passes min(3) and is stored in DB. Surfaced by exploratory run 2026-05-05. |
| Zod validation error messages displayed in English | `src/pages/register-provider.astro`, `src/components/directory/ProviderRegistrationForm.astro` | All Zod field-level errors (e.g. "Too small: expected string to have >=3 characters") are in English; Spanish UI requires Spanish errors. Surfaced by exploratory run 2026-05-05. |
| Double-submit creates duplicate `provider_registrations` rows | `src/actions/index.ts` handler, `src/lib/queries/providerRegistrations.ts` | `form.requestSubmit()` called twice creates two rows. No DB uniqueness constraint, no submit button disable, no idempotency key. Confirmed by exploratory run 2026-05-05. |
| `requiredText()` null-coercion path outputs English Zod error | `src/actions/index.ts` `requiredText()` factory | HTML forms send `""` for empty fields; Astro coerces to `null`; `z.string()` fires English `"Invalid input: expected string, received null"` before transform/refine. Affects `businessName`, `contactName`. Found by TC-RGR-004 verification run 2026-05-05. BUG-004. |

---

## Feature × test type coverage matrix

`✅` = covered, with test ID(s); `🟡` = partial; `❌` = missing; `—` = N/A for this feature.

| Feature | Smoke | Forms | Flows | A11y | Performance | Regression |
|---|---|---|---|---|---|---|
| Home page (`/`) | TC-SMK-001 | — | TC-FLW-001 | ❌ | ❌ | — |
| Canton landing (`/{canton}/`) | TC-SMK-002 | — | TC-FLW-001 | ❌ | ❌ | — |
| District landing (`/{canton}/{distrito}/`) | TC-SMK-002 | — | TC-FLW-001 | ❌ | ❌ | — |
| Category listing (`/{canton}/{distrito}/{categoria}`) | ❌ | — | TC-FLW-002 | ❌ | ❌ | TC-RGR-001 |
| Provider profile (`/proveedor/{id}-{slug}`) | TC-SMK-002 | — | TC-FLW-003 | ❌ | ❌ | — |
| Search (`/search?q=`) | ❌ | ❌ | ❌ | ❌ | ❌ | — |
| Provider registration (`/register-provider`) | ❌ | TC-FRM-001 | ❌ | ❌ | — | TC-RGR-003, TC-RGR-004, TC-RGR-005 |
| Magic-link login (`/account/login`) | ❌ | ❌ | ❌ | ❌ | — | — |
| Edit profile (`/account/edit/[id]`) | ❌ | ❌ | ❌ | ❌ | — | — |
| Account dashboard (`/account`) | ❌ | — | ❌ | ❌ | — | — |
| Legal pages (`/legal/*`) | ❌ | — | — | ❌ | — | — |
| 404 page | ❌ | — | — | ❌ | — | — |
| Sitemap (`/sitemap-index.xml`) | ❌ | — | — | — | ❌ | — |
| Robots (`/robots.txt`) | ❌ | — | — | — | — | — |

---

## Cross-cutting checks (run on every page touched in a session)

| Check | What it verifies |
|---|---|
| `<title>` unique and < 60 chars | SEO |
| `<meta name="description">` present and < 160 chars | SEO |
| `<link rel="canonical">` matches the page URL | SEO duplicate-content |
| Single `<h1>` per page | SEO + a11y |
| All images have `alt` and explicit `width`/`height` | a11y + CLS |
| JSON-LD validates against schema.org | Rich results |
| Console clean (no errors, no warnings re. hydration) | Bug surface |
| No 4xx/5xx in network log | Broken assets |
| Keyboard-only navigation reaches every interactive control | a11y |
| Tab order is logical | a11y |
| `aria-label` on icon-only buttons | a11y |
| Theme color contrast ≥ 4.5:1 for text, 3:1 for UI | a11y / WCAG AA |

---

## Critical user journeys (E2E)

### J1. Browse → contact (the SEO funnel)
1. Land on home from search engine
2. Pick canton → district → category
3. Click a provider card → arrive at profile
4. Click WhatsApp / phone → handler opens correctly
5. Verify: every step has correct meta, breadcrumbs, JSON-LD

Coverage target: **TC-FLW-001**, **TC-FLW-002**, **TC-FLW-003**

### J2. Provider self-service registration
1. Click "Sos proveedor" CTA from any page
2. Fill registration form (district autocomplete, categories chip-select, payment methods, description)
3. Submit
4. Receive confirmation page
5. Verify: row exists in `providers` with `verified=false`, `owner_id=null` (not yet authenticated)

Coverage target: **TC-FRM-001** (validation), **TC-FLW-004** (full E2E)

### J3. Provider edits and republishes
1. Magic-link login as a verified provider
2. Land on `/account` dashboard, see published profile
3. Click "Editar perfil"
4. Change phone, description, response time
5. Save → see green success notice
6. Open public profile in another tab → changes visible
7. Verify: DB has new values, RLS prevented other users from seeing draft

Coverage target: **TC-FLW-005**

### J4. Customer leaves a review
1. Open a provider profile
2. Click "Dejar reseña" CTA (if implemented)
3. Submit rating + comment
4. Verify: review appears on profile, rating average updates, count increments

Coverage target: **TC-FLW-006** (deferred — feature behind Server Islands)

### J5. Anti-thin-content / 404 boundary
1. Visit a category listing with 0 verified providers in the district
2. Verify: 404 (not soft 404 with EmptyState)
3. Visit one with 1+ verified provider → 200 with EmptyState only when filters reduce to 0

Coverage target: **TC-RGR-001**, **TC-FLW-007**

---

## Performance budgets (enforced)

| Page | LCP target | Total weight | Client JS gzipped |
|---|---|---|---|
| Home | 1.5s | 80 KB | 35 KB |
| District landing | 1.8s | 100 KB | 40 KB |
| Category listing | 1.8s | 120 KB | 50 KB |
| Provider profile | 2.0s | 150 KB | 80 KB |

Test infrastructure: Lighthouse via `mcp__chrome-devtools__lighthouse_audit` on each page on a "Slow 4G" emulated network. Failure thresholds: any LCP > target × 1.4, any weight > target × 1.5.

Coverage target: **TC-PRF-001..004** (one per page type, missing).

---

## Negative testing checklist (per form)

| Test class | Provider registration | Login | Edit profile | Review |
|---|---|---|---|---|
| All-empty submit | TC-FRM-001 | ❌ | ❌ | ❌ |
| Whitespace-only required field | TC-RGR-003 | ❌ | ❌ | ❌ |
| Field over `maxlength` | TC-RGR-004 | — | ❌ | ❌ |
| Field below `minlength` | TC-RGR-003, TC-RGR-004 | — | ❌ | ❌ |
| Invalid email format | TC-RGR-004 | ❌ | — | ❌ |
| Invalid phone format | TC-RGR-004 | — | ❌ | — |
| Honeypot field filled (spam guard) | TC-FRM-001 | — | — | ❌ |
| Double-submit | TC-RGR-005 | ❌ | ❌ | ❌ |
| Network drops during submit | ❌ | ❌ | ❌ | ❌ |
| 500 from action handler | ❌ | ❌ | ❌ | ❌ |
| Locale mismatch (en form on es page) | ❌ | ❌ | — | ❌ |

---

## Browser & device matrix

| Tier | Browsers | Viewports | Network |
|---|---|---|---|
| Tier 1 (smoke must pass) | Chromium 120+ | 1920×1080, 390×844 (iPhone 14) | Fast 4G |
| Tier 2 (regression on demand) | Firefox 120+, WebKit 17+ | 1280×720, 768×1024, 360×640 | Slow 4G |
| Tier 3 (manual only) | Mobile Safari real device, Mobile Chrome real device | — | 3G |

The agent runs Tier 1 by default. Bumping to Tier 2 requires explicit user request ("run cross-browser") or release-gate context.

---

## Open work (highest leverage first)

1. ~~Smoke suite for canton/district/profile pages~~ — covered by **TC-SMK-002** (2026-05-05). Category listing smoke still pending (TC-SMK-003).
2. ~~`toE164` helper boundary values~~ — covered by **TC-RGR-002** (2026-05-05). Phase A unit-style + Phase B wiring verification. **End-to-end run verified PASS 2026-05-05** (11/11 unit cases + JSON-LD telephone + tel: href confirmed E.164).
3. ~~**TC-RGR-003**: ZWSP bypass of `.trim().min(3)`~~ — verified PASS 2026-05-05. All 3 phases pass. Fix confirmed working.
4. **TC-RGR-004**: Zod errors in Spanish — verified FAIL 2026-05-05. **BUG-004 found**: `businessName=empty` and `contactName=empty` still produce English `"Invalid input: expected string, received null"`. Fix incomplete: `requiredText()` needs `{ invalid_type_error: 'Campo requerido.' }` on `z.string()` call.
5. ~~**TC-RGR-005**: Double-submit duplicates~~ — verified PASS 2026-05-05. All 4 phases pass. DB unique index + Spanish CONFLICT message confirmed.
6. Form validation suite for provider registration (TC-FRM-003 — description boundary values).
7. Review form coverage (TC-FRM-002): all invalid-input paths + bypass via `form.requestSubmit()` (see risk register).
8. Performance baselines for the 4 page types — one Lighthouse run per page on Slow 4G (TC-PRF-001..004).
9. A11y baselines using `toMatchAriaSnapshot` on each page template (TC-A11Y-001 for ProviderContactBox accessible names is highest priority — verified by context7 against WCAG ARIA14).
10. Auth happy-path E2E (TC-FLW-008) — magic link → session → logout.
11. Search edge cases (no query, very short query, accent normalization, no results state) — TC-FLW-003.
12. RLS isolation (TC-RLS-001): anon vs authenticated-other-user vs owner can/cannot read draft providers.
13. Custom element re-init after View Transition (TC-FLW-004 for ChipSelect, TC-FRM-004 for StarRating).
14. Sitemap and robots.txt smoke (TC-SMK-003).
15. Provider profile `?from=` back-link behavior (TC-FLW-002) — paired with TC-RGR-006 (Alpine x-init regex workaround, premise unverified per context7 2026-05-05).

The agent should pick from this list in priority order when asked to "extend coverage" without a specific target.
