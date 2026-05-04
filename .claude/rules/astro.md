# Astro rules for this project

Applies to: `src/pages/`, `src/components/`, `src/layouts/`, `src/actions/`. See `architecture.md` for full rationale; this file is the quick rule sheet.

## Required
- Astro 5+ with `output: 'static'` by default (SSG)
- The `'hybrid'` output mode no longer exists. If we ever need on-demand pages, use `output: 'server'` and opt individual pages into prerendering with `export const prerender = true`
- `getStaticPaths()` in EVERY dynamic route, and skip combinations with zero providers
- Import the Supabase client only via `@lib/supabase` (path alias) — never instantiate directly
- Data fetching lives in `@lib/queries/<domain>.ts` — never inline in `.astro` frontmatter
- Use `<Image>` from `astro:assets` for every image (never bare `<img>`); remote URLs require explicit `width` and `height`
- Every page has its own `<head>` with unique meta tags + appropriate JSON-LD
- Use Astro Actions (`src/actions/`) for mutations, not API routes
- Use Server Islands (`server:defer`) for chunks that change faster than the build cycle (reviews, recent activity)
- View Transitions enabled site-wide via `<ClientRouter />` in `BaseLayout`

## Forbidden
- Importing React/Vue/Svelte in components (not installed)
- Direct `fetch()` calls to Supabase URLs — always use the typed client
- Hardcoding canton, district, or category IDs (derive from URL slug)
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
