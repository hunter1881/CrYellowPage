---
name: cr-geo
description: Costa Rica geographic data, official INEC seed generation, administrative hierarchy, and location slugs. Use me when working with locations, URL slugs, geography migrations, seed data, or canton/district routing.
---

# Costa Rica geography for El Contactico

## Administrative model

Use Costa Rica's official administrative hierarchy:

```text
countries -> provinces -> cantons -> districts
```

For global naming, this maps to:

```text
country -> region -> subregion -> locality
```

Keep domain table names explicit (`provinces`, `cantons`, `districts`) because the product and URLs are Costa Rica-specific.

## Official source

Geography seed data comes from INEC **Unidad Geoestadistica Distrital 2024**.

Current local source file:

```text
supabase/sources/inec-uged-2024.dbf
```

Generator:

```bash
npm run db:seed:generate
```

The generator must validate before writing `supabase/seed.sql`:

- 7 provinces
- 84 cantons
- 492 districts

Do not hand-write the full geography seed. Update the DBF source and generator instead.

## Seed fields

The generated seed includes:

- country ISO2/ISO3
- province code/name/slug
- canton code/name/slug
- district code/name/slug
- `postal_code`, currently equal to the official 5-digit district code
- `area_m2`
- `source`
- `source_updated_at`

## Slug format
- No accents, no ñ, no special characters
- All lowercase
- Spaces replaced with hyphens

Examples:
- "San José" → "san-jose"
- "Cartago" → "cartago"
- "San Nicolás" → "san-nicolas"
- "Tres Ríos" → "tres-rios"
- "Tibás" → "tibas"

## Slug generator function (Node.js)
```js
function toSlug(text) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip combining diacritical marks
    .replace(/[ñÑ]/g, 'n')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
```

Use `toSlug` from `@lib/slug` in app code. The seed generator has its own equivalent function because it runs as a Node script.

## Service categories for seed

Starter categories currently generated in `scripts/generate-geography-seed.mjs`:

- Fontaneria
- Electricidad
- Limpieza
- Jardineria
- Reparaciones
- Cerrajeria
- Pintura
- Aire acondicionado

Visible copy can use Spanish accents. Slugs must stay unaccented.
