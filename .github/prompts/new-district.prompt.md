---
mode: agent
description: Add a new district to the system. Inserts canton and district data into Supabase and verifies the URLs work.
tools:
  - codebase
  - terminal
---

I want to add a new district to the directory. Follow these steps:

1. Ask me: what is the name of the canton and the district?
2. Generate a kebab-case, unaccented slug for both (e.g., "San José" → "san-jose")
3. Show the SQL to insert into Supabase:
```sql
INSERT INTO cantons (name, slug)
  VALUES ('{canton}', '{canton-slug}')
  ON CONFLICT (slug) DO NOTHING;

INSERT INTO districts (canton_id, name, slug)
  VALUES (
    (SELECT id FROM cantons WHERE slug='{canton-slug}'),
    '{district}',
    '{district-slug}'
  );
```
4. Verify it doesn't already exist:
```sql
SELECT * FROM districts WHERE slug='{district-slug}';
```
5. Confirm the URL `/{canton-slug}/{district-slug}` would work with the current page structure in `src/pages/[canton]/[distrito]/`
