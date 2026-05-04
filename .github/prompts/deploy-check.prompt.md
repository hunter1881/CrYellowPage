---
mode: agent
description: Pre-deploy checklist. Verifies everything is ready before pushing to Vercel.
tools:
  - codebase
  - terminal
---

Before deploying, run these checks:

## Automatic checks
Run the following commands and review the output:
- `npm run build`
- `git status`
- `git diff --stat HEAD~1`

## Manual checklist — ask me each one:

### Security
- [ ] Are there any secrets or API keys in the code? (search src/)
- [ ] Is `.env` in `.gitignore`?
- [ ] Are `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` set in Vercel?

### SEO
- [ ] Do all new pages have meta tags?
- [ ] Is the sitemap up to date?

### Functionality
- [ ] Do the dynamic routes `[canton]/[district]/[category]` work?
- [ ] Does the provider registration form submit data correctly?
- [ ] Do provider images load from Supabase Storage?

### Multi-district
- [ ] Is any district slug hardcoded in the code? If so, mark it as `TODO: multi-district`

If everything passes, commit and push:
```bash
git add -A && git commit -m "feat: [describe the change]" && git push
```
