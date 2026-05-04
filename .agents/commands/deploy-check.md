---
description: Pre-deploy checklist for Vercel.
---

# Deploy Check

Before deploying:

1. Run `npm run build`.
2. Run `git status`.
3. Review the latest diff with `git diff`.
4. Check for secrets or API keys in source files.
5. Confirm `.env` is ignored.
6. Confirm `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set in Vercel.
7. Confirm `SUPABASE_SERVICE_ROLE_KEY` is not exposed through any `PUBLIC_*` variable.
8. Confirm new pages have metadata and canonical URLs.
9. Confirm dynamic routes use the `/{canton}/{district}/{category}` pattern.
10. Confirm provider images load from Supabase Storage.
11. Confirm geography seed still validates 7 provinces, 84 cantons, and 492 districts if seed files changed.
12. Flag any hardcoded district as multi-district debt.

If everything passes, commit and push only when the user asks for it.
