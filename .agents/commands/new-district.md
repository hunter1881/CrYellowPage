---
description: Add a new district to the system.
---

# New District

When the user wants to add a district:

1. Ask for canton name and district name.
2. Generate kebab-case, unaccented slugs for both.
3. Show SQL to insert the canton and district.
4. Verify the district does not already exist.
5. Confirm whether the expected URL path is supported by the current page structure.

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
