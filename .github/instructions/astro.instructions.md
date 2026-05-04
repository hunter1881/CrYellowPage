---
applyTo: "**/*.astro,astro.config.mjs"
---

# Astro rules for DirectorioLocal CR

## Required
- Astro 5+ with `output: 'static'` by default (SSG)
- `'hybrid'` output mode no longer exists. Use `output: 'server'` + `export const prerender = true` per page if needed
- `getStaticPaths()` in EVERY dynamic route; skip combinations with zero providers
- Import the Supabase client only via `@lib/supabase` — never instantiate directly
- Data fetching lives in `@lib/queries/<domain>.ts` — never inline in `.astro` frontmatter
- Use `<Image>` from `astro:assets` for every image (never bare `<img>`); remote URLs require explicit `width` and `height`
- Every page has its own `<head>` with unique meta tags + appropriate JSON-LD
- Use Astro Actions (`src/actions/`) for mutations, not API routes
- Use Server Islands (`server:defer`) for chunks that change faster than the build cycle
- View Transitions enabled site-wide via `<ClientRouter />` in `BaseLayout`

## Forbidden
- Importing React/Vue/Svelte in components (not installed)
- Direct `fetch()` calls to Supabase URLs — always use the typed client
- Hardcoding canton, district, or category IDs
- `console.log` in production (use `logger` from `@lib/logger`)
- `select('*')` in production code
- Business logic in `.astro` frontmatter (push to `@lib/queries/`)
- `../../../` import chains — use path aliases

## Path aliases (in `tsconfig.json`)
- `@components/*` → `./src/components/*`
- `@layouts/*` → `./src/layouts/*`
- `@lib/*` → `./src/lib/*`
- `@types/*` → `./src/types/*`
- `@actions/*` → `./src/actions/*`

## Naming
- Components: `PascalCase.astro`
- Pages: `kebab-case.astro` or `[slug].astro`
- Props: `camelCase`
- Types/interfaces: `PascalCase`

## Component structure
- `src/components/ui/` — generic primitives (Button, Card, Badge, Input)
- `src/components/directory/` — domain-specific (ProviderCard, CategoryGrid, SearchBar)
- `src/components/seo/` — JsonLd, OpenGraph, Breadcrumbs

## Pre-delivery checklist
- [ ] Complete meta tags + JSON-LD on every page
- [ ] No `console.log` (use `logger` from `@lib/logger`)
- [ ] Images have `alt` text and explicit `width`/`height` if remote
- [ ] Internal links use correct slugs (kebab-case, unaccented)
- [ ] No business logic in `.astro` frontmatter — push to `@lib/queries/`
- [ ] No `select('*')` — explicit columns only
- [ ] Path aliases used (no `../../../`)
- [ ] Empty listings skipped in `getStaticPaths()`
