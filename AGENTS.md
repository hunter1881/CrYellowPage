# El Contactico

Hyperlocal services directory for Costa Rica. It starts with one district, but the architecture must support every canton and district in the country from day one.

## Stack
- Frontend: Astro 6 + Alpine.js, SSG-first, SEO-first, no heavy JS frameworks
- Database: Supabase, PostgreSQL, Auth, Storage, auto-generated API
- Hosting: Vercel via git push
- Styling: Tailwind CSS
- Language: TypeScript strict

## Key Architecture
- URLs use `/{canton}/{district}/{category}`, for example `/cartago/san-nicolas/fontaneria`.
- Multi-tenancy is data-based, not code-based. One deploy serves all of Costa Rica, filtered by `canton_id` and `district_id`.
- Providers have `district_id`, categories through a many-to-many relation, `owner_id` linked to `auth.users`, photo, phone, and WhatsApp.
- There is no custom backend. Frontend code uses the typed Supabase JS client; mutations go through Astro Actions.
- SEO is a core requirement. Astro must generate indexable HTML for canton, district, category, and provider pages.
- `LocalBusiness` schema should include `areaServed` for hyperlocal AI overview matching.

## Project Structure
```text
src/
  pages/
    index.astro
    [canton]/
      index.astro
      [distrito]/
        index.astro
        [categoria].astro
    proveedor/[id].astro
    api/
  components/
    ui/
    directory/
    seo/
  layouts/
  lib/
    supabase.ts
    queries/
    seo/
    slug.ts
    logger.ts
  actions/
    index.ts
  types/
    database.types.ts
  env.d.ts
```

Path aliases are expected in `tsconfig.json`:
- `@components/*`
- `@layouts/*`
- `@lib/*`
- `@types/*`
- `@actions/*`

Use aliases instead of deep relative import chains.

## Data Model
- `cantons` has `id`, `name`, `slug`.
- `districts` has `id`, `canton_id`, `name`, `slug`.
- `categories` has `id`, `name`, `slug`, `icon_emoji`.
- `providers` has `id`, `name`, `phone`, `whatsapp`, `email`, `description`, `photo_url`, `district_id`, `owner_id`, `verified`, `created_at`.
- `provider_categories` has `provider_id`, `category_id`.
- `reviews` has `id`, `provider_id`, `author_id`, `rating`, `comment`, `created_at`.

All tables have RLS enabled. `providers` and `categories` are publicly readable when appropriate; provider writes are gated to `auth.uid() = owner_id`.

## Required Conventions
- Slugs are always kebab-case and unaccented. Use `toSlug` from `@lib/slug`.
- Every Supabase query lives in `src/lib/queries/<domain>.ts`; never inline database access in `.astro` frontmatter.
- Every provider query filters by `district_id` at minimum.
- No `select('*')` in production. List columns explicitly.
- Astro components are presentational. Business logic lives in `src/lib/`.
- Mutations such as registration, reviews, and photo upload go through Astro Actions in `src/actions/`, not API routes.
- Provider images live in the public Supabase Storage bucket `provider-photos`.
- Environment variables are `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or `PUBLIC_*` variables.
- Never hardcode canton, district, or category IDs.
- Dynamic Astro routes must use generic `getStaticPaths()` and should skip empty or thin-content combinations.

## Source Of Truth (read before non-trivial changes)
Rules:
- `.agents/rules/architecture.md` — full architecture rationale
- `.agents/rules/antipatterns.md` — 15 concrete before/after patterns to never introduce
- `.agents/rules/performance.md` — render hierarchy, image rules, JS bundle, perf budgets (LCP < 1.8s, JS < 50 KB)
- `.agents/rules/queries.md` — Supabase query rules: columns, batching, indexes, RLS write rules
- `.agents/rules/astro.md` — Astro quick rules
- `.agents/rules/supabase.md` — Supabase quick rules
- `.agents/rules/multi-district.md` — multi-tenancy invariants

Skills:
- `.agents/skills/astro-patterns/SKILL.md` — copyable Astro patterns
- `.agents/skills/astro-seo/SKILL.md` — SEO templates and JSON-LD
- `.agents/skills/supabase-patterns/SKILL.md` — Supabase query/storage patterns
- `.agents/skills/supabase-postgres-best-practices/SKILL.md` — Postgres optimization references

Agents (delegate explicitly):
- `code-reviewer` — antipatterns/performance/queries/security/SEO review before commit
- `qa-tester` — designs and runs tests via Playwright + Chrome DevTools MCP, persists to `qa/`
- `performance-auditor` — static analysis for speed (complements qa-tester live Lighthouse)
- `db-architect` — schema, migrations, RLS, indexes
- `frontend-dev` — Astro components, pages, layouts
- `seo-agent` — meta tags, JSON-LD, sitemaps

QA system (cross-tool):
- `qa/README.md` — folder layout and test-case format
- `qa/test-plan.md` — coverage matrix, risk register, performance budgets
- `qa/test-cases/` — durable test corpus
- `qa/runs/` — per-run results with evidence
- `qa/fixtures/` — test users and seed data

## Checks
- Build: `npm run build`
- Dev server: `npm run dev`
- Type/schema generation after schema changes: `npm run db:types`
- Git status: `git status`
