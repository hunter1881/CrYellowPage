---
mode: agent
description: Guide for adding a new service provider to the directory manually or via SQL.
tools:
  - codebase
  - terminal
---

I want to add a new provider to the directory.

1. Ask me for the provider's data:
   - Full name
   - Phone (CR format: 8888-8888)
   - WhatsApp (with country code: +50688888888)
   - Email (optional)
   - Short description (max 200 chars)
   - Canton and district where they operate
   - Categories (can be more than one)

2. Verify that the district exists in the DB

3. Generate the insertion SQL:
```sql
INSERT INTO providers (name, phone, whatsapp, email, description, district_id, verified)
VALUES ('{name}', '{phone}', '{whatsapp}', '{email}', '{description}',
  (SELECT id FROM districts WHERE slug='{district-slug}'), false);
```

4. For each category, add the relation:
```sql
INSERT INTO provider_categories (provider_id, category_id)
VALUES (
  (SELECT id FROM providers WHERE name='{name}' ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM categories WHERE slug='{category-slug}')
);
```

5. Ask me whether to mark the provider as `verified = true`
