---
applyTo: "src/lib/slug.ts,src/lib/queries/geography.ts,supabase/seed.sql,supabase/migrations/**"
---

# Costa Rica geography for El Contactico

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

## Slug generator function (TypeScript)
```ts
// src/lib/slug.ts
export function toSlug(text: string): string {
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

## Main cantons for initial seed
```sql
INSERT INTO cantons (name, slug) VALUES
  ('San José', 'san-jose'),
  ('Cartago', 'cartago'),
  ('Heredia', 'heredia'),
  ('Alajuela', 'alajuela'),
  ('Tibás', 'tibas'),
  ('Curridabat', 'curridabat'),
  ('Desamparados', 'desamparados');
```

## Service categories for seed
```sql
INSERT INTO categories (name, slug, icon_emoji) VALUES
  ('Fontanería', 'fontaneria', '🔧'),
  ('Electricidad', 'electricidad', '⚡'),
  ('Construcción', 'construccion', '🏗️'),
  ('Repostería y pasteles', 'reposteria', '🎂'),
  ('Pintura', 'pintura', '🎨'),
  ('Jardinería', 'jardineria', '🌱'),
  ('Mecánica', 'mecanica', '🔩'),
  ('Limpieza del hogar', 'limpieza', '🧹'),
  ('Carpintería', 'carpinteria', '🪵'),
  ('Refrigeración', 'refrigeracion', '❄️');
```

## Adding a new district
```sql
INSERT INTO cantons (name, slug)
  VALUES ('{canton}', '{canton-slug}')
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO districts (canton_id, name, slug)
  VALUES (
    (SELECT id FROM cantons WHERE slug = '{canton-slug}'),
    '{district}',
    '{district-slug}'
  );
```

Always verify before inserting:
```sql
SELECT * FROM districts WHERE slug = '{district-slug}';
```
