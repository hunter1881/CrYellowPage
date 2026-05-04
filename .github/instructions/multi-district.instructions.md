---
applyTo: "**"
---

# Multi-district architecture rules

This project must ALWAYS be ready to serve multiple districts and cantons, even though only one is in use today.

## Required rules

1. **Never hardcode a district_id or canton_id in the code**
   - Bad: `const districtId = 'abc-123'`
   - Good: derive the ID from the slug in the URL

2. **Slugs in the URL, IDs in the DB**
   - URLs show slugs: `/cartago/san-nicolas/fontaneria`
   - The DB works with UUIDs internally
   - The slug→id conversion happens in `getStaticPaths()` or in the fetch

3. **`getStaticPaths()` must be generic**
   - It must query EVERY active district in the DB
   - Don't filter by a specific canton unless the user explicitly asks for it

4. **Tech debt**: If something is hardcoded for time reasons, mark it with:
   ```
   // TODO: multi-district — currently hardcoded for San Nicolás
   ```

5. **Canton/district selector** on the home must show ALL available in the DB
