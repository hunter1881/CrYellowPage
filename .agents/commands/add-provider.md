---
description: Guide for adding a new service provider to the directory manually or via form.
---

# Add Provider

When the user wants to add a provider:

1. Ask for:
   - Full name
   - Phone, Costa Rica format `8888-8888`
   - WhatsApp with country code, for example `+50688888888`
   - Email, optional
   - Short description, max 200 characters
   - Canton and district
   - One or more categories
2. Verify that the district exists in the database.
3. Generate insertion SQL for `providers`.
4. Generate insertion SQL for each `provider_categories` relation.
5. Ask whether the provider should be marked `verified = true`.

```sql
INSERT INTO providers (name, phone, whatsapp, email, description, district_id, verified)
VALUES (
  '{name}',
  '{phone}',
  '{whatsapp}',
  '{email}',
  '{description}',
  (SELECT id FROM districts WHERE slug = '{district-slug}'),
  false
);
```

```sql
INSERT INTO provider_categories (provider_id, category_id)
VALUES (
  (SELECT id FROM providers WHERE name = '{name}' ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM categories WHERE slug = '{category-slug}')
);
```
