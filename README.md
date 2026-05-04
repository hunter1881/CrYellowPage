# CrYellowPage / DirectorioLocal CR

Hyperlocal services directory for Costa Rica, built to index providers by province, canton, district, and service category.

The product starts with Aserri / Vuelta de Jorco as the first usable district, but the data model and static route strategy are designed for all of Costa Rica from day one.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Astro 5 + Alpine.js |
| Styling | Tailwind CSS |
| Language | TypeScript strict |
| Database | Supabase PostgreSQL |
| Auth / Storage | Supabase Auth + Supabase Storage |
| Hosting | Vercel |
| Rendering | SSG-first, SEO-first |

No React/Vue/Svelte runtime is used in the app. The React files in `Template/` are visual reference only.

## Product Direction

The UI direction comes from the Claude Design prototype in `Template/`.

- `Template/tokens.jsx`: visual themes. Theme A "Civic" is the base direction.
- `Template/components.jsx`: reference components such as Header, MobileDrawer, SearchModule, LocationModal, ProviderCard, StickyContact, Footer.
- `Template/pages.jsx`: reference page layouts for Home, Canton, District, Category, and Provider pages.
- `Template/data.js`: demo data used by the prototype.

Astro components should port the intent of the template, not copy React/Babel code.

## URL Model

Directory URLs are local-first:

```text
/{canton}/{district}/{category}
```

Examples:

```text
/aserri/vuelta-de-jorco/fontaneria/
/proveedor/00000000-0000-4000-8000-000000000301-don-rafa-fontaneria/
```

Provider URLs use `id-name-slug`. The UUID is the stable lookup key; the readable slug is decorative.

## Geography Model

The backend uses Costa Rica's official administrative hierarchy:

```text
countries -> provinces -> cantons -> districts
```

For global terminology, this maps to:

```text
country -> region -> subregion -> locality
```

The geography seed is generated from INEC's official **Unidad Geoestadistica Distrital 2024** DBF source.

Validated seed counts:

- 7 provinces
- 84 cantons
- 492 districts

The generated seed includes:

- Official district code
- Postal/district code
- Province, canton, and district names
- Kebab-case slugs without accents
- Area in square meters
- INEC source update date
- Seed categories
- Demo providers and reviews for Vuelta de Jorco

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
    registrar-proveedor.astro
    robots.txt.ts
  components/
    directory/
    i18n/
    seo/
    ui/
  layouts/
    BaseLayout.astro
  lib/
    queries/
    seo/
    logger.ts
    mockData.ts
    providerPresentation.ts
    site.ts
    slug.ts
    supabase.ts
  actions/
  styles/
  types/

supabase/
  migrations/
  sources/
  seed.sql

scripts/
  generate-db-types.mjs
  generate-geography-seed.mjs
```

## Database Tables

Core geography:

```text
countries
provinces
cantons
districts
```

Directory:

```text
categories
providers
provider_categories
reviews
```

Important provider fields:

```text
district_id
owner_id
verified
accepts_sinpe
works_weekends
years_active
completed_jobs
response_time_minutes
photo_url
phone
whatsapp
```

All tables use Row Level Security. Public reads are allowed for geography, categories, reviews, and verified providers. Provider writes are gated by `auth.uid() = owner_id`.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required values:

```env
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_SERVICE_ROLE_KEY=server-only-service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it through `PUBLIC_*` variables and never use it in frontend code.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:4321/
```

Useful local demo routes:

```text
/
/aserri/
/aserri/vuelta-de-jorco/
/aserri/vuelta-de-jorco/fontaneria/
/proveedor/00000000-0000-4000-8000-000000000301-don-rafa-fontaneria/
/registrar-proveedor/
```

The app has fallback mock data so the UI can run before a real Supabase project is connected.

## Supabase Setup

Generate the geography seed from the INEC DBF source:

```bash
npm run db:seed:generate
```

Apply the migration:

```bash
npx supabase db push
```

Then run `supabase/seed.sql` in Supabase SQL editor or through your preferred Supabase workflow.

After schema changes, regenerate database types:

```bash
npm run db:types
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Astro dev server |
| `npm run check` | Run Astro type checks |
| `npx tsc --noEmit` | Run TypeScript checks |
| `npm run build` | Run checks and build static site |
| `npm run preview` | Preview production build |
| `npm run db:seed:generate` | Generate `supabase/seed.sql` from INEC DBF |
| `npm run db:types` | Generate Supabase TypeScript types |

## Architecture Rules

- SSG-first. Directory pages must render indexable HTML.
- Data access belongs in `src/lib/queries/*`, not inline in `.astro` frontmatter.
- No `select('*')` in production queries.
- No hardcoded canton, district, or category IDs.
- Provider queries must filter by `district_id` at minimum.
- Mutations go through Astro Actions, not API routes.
- Components stay presentational; business logic lives in `src/lib`.
- Slugs are kebab-case and unaccented.
- Spanish is the default visible language. English is optional through `TranslatedText.astro`.

## SEO

Every public page should include:

- Unique title and meta description
- Canonical URL
- Open Graph tags
- Structured data

Structured data targets:

| Page | JSON-LD |
| --- | --- |
| Home | `WebSite` |
| Canton | `Place` + `BreadcrumbList` |
| District | `Place` + `BreadcrumbList` |
| Category listing | `ItemList` + `BreadcrumbList` |
| Provider profile | `LocalBusiness` with `areaServed` |

## Current Status

Implemented:

- Astro shell and global layout
- Civic visual direction from the template
- ES/EN language switcher
- Header, footer, mobile drawer, location modal
- Search bar
- Home, canton, district, category listing, provider profile
- Provider sticky mobile contact bar
- Register provider placeholder page
- Supabase schema migration
- INEC-based geography seed generator

Next backend steps:

- Apply the migration to Supabase
- Run the generated seed
- Regenerate DB types
- Update queries for the new `provinces` relation
- Replace demo provider presentation fields with real DB fields
- Implement provider registration with Astro Actions
- Implement reviews with Supabase writes and Server Islands where needed

## Deployment

The intended deployment target is Vercel.

Build command:

```bash
npm run build
```

Environment variables needed in Vercel:

```text
PUBLIC_SITE_URL
PUBLIC_SUPABASE_URL
PUBLIC_SUPABASE_ANON_KEY
```

Add `SUPABASE_SERVICE_ROLE_KEY` only if server-side admin actions are deployed, and keep it server-only.
