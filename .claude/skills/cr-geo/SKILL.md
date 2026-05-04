---
name: cr-geo
description: Costa Rica geographic data: cantons, districts, and how to handle slugs. Use me when working with locations, URL slugs, or geographic data inserts.
---

# Costa Rica geography for DirectorioLocal

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
