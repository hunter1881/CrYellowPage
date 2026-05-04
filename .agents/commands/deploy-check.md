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
7. Confirm new pages have metadata and canonical URLs.
8. Confirm dynamic routes use the `/{canton}/{district}/{category}` pattern.
9. Confirm provider images load from Supabase Storage.
10. Flag any hardcoded district as multi-district debt.

If everything passes, commit and push only when the user asks for it.
