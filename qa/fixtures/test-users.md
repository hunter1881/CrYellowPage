# Test users & test data

## Important

These fixtures describe **what should exist** in the dev database, not what's automatically created. The agent reads this file to know which credentials/IDs to use; the human (or seed script) creates them.

Never paste real production credentials here. This file is committed to the repo.

---

## Test accounts

### Provider (verified, owns one published listing)

| Field | Value |
|---|---|
| Email | `qa-provider@directoriolocal.test` |
| Auth | Magic link (no password) |
| `auth.users.id` | _(filled after first sign-up)_ |
| Provider name | "QA Test Provider" |
| District | `vuelta-de-jorco` (Aserrí) |
| Categories | `fontaneria`, `reparaciones` |
| `verified` | true |
| Notes | Use this account for "edit profile" and "owner can read draft" tests |

### Provider (unverified, applied via form)

| Field | Value |
|---|---|
| Email | `qa-pending@directoriolocal.test` |
| Auth | Magic link |
| Provider name | "QA Pending Application" |
| District | `vuelta-de-jorco` |
| `verified` | false |
| Notes | Created by running TC-FRM-001 happy-path. Used to test admin-verification flow and dashboard "underReview" state. |

### Reviewer (authenticated, no provider profile)

| Field | Value |
|---|---|
| Email | `qa-reviewer@directoriolocal.test` |
| Auth | Magic link |
| Notes | Used for review-submission tests. Should NOT be able to read other users' draft providers (RLS test). |

---

## Known test data (from `supabase/seed.sql`)

| Entity | Slug / ID | Notes |
|---|---|---|
| Canton | `aserri` | Province: San José |
| District | `vuelta-de-jorco` (postal `10603`) | Hosts all seed providers |
| Category | `fontaneria` | 3 verified providers in vuelta-de-jorco |
| Category | `reparaciones` | 2 verified providers in vuelta-de-jorco |
| Provider | UUID `00000000-0000-4000-8000-000000000301` ("Don Rafa Fontanería") | verified=true, has reviews |
| Provider | UUID `00000000-0000-4000-8000-000000000302` ("Fontanería Emergencia 24") | verified=true, fontaneria only |
| Provider | UUID `00000000-0000-4000-8000-000000000303` ("Servicios Jorco") | verified=true, fontaneria + reparaciones |

These IDs are deterministic UUIDs from the seed — safe to hardcode in test cases as expected reference points.

---

## URLs the agent uses most

```
http://localhost:4321/                                              # home
http://localhost:4321/aserri/                                       # canton landing
http://localhost:4321/aserri/vuelta-de-jorco/                       # district landing
http://localhost:4321/aserri/vuelta-de-jorco/fontaneria             # category listing (3 providers)
http://localhost:4321/aserri/vuelta-de-jorco/reparaciones           # category listing (2 providers — TC-RGR-001 target)
http://localhost:4321/proveedor/00000000-0000-4000-8000-000000000301-don-rafa-fontaneria  # provider profile
http://localhost:4321/register-provider                             # registration form
http://localhost:4321/account/login                                 # magic-link login
http://localhost:4321/account                                       # dashboard
http://localhost:4321/search?q=fontanero                            # search
```

---

## Network conditions for performance tests

| Profile | Download | Upload | Latency |
|---|---|---|---|
| Fast 4G (default) | 9 Mbps | 1.5 Mbps | 150 ms |
| Slow 4G (perf budget threshold) | 1.6 Mbps | 750 Kbps | 300 ms |
| 3G (Tier 3 only) | 750 Kbps | 250 Kbps | 400 ms |

Use Chrome DevTools `mcp__chrome-devtools__emulate` to set these.

---

## Cleanup

When the agent creates test data via the registration form (TC-FRM-001 step 31 onward), it must clean up:

1. Note the new provider UUID returned from the action
2. After the test completes, delete the row via Supabase admin RPC OR mark the row with a known suffix (e.g. name ends in `[QA-TEMP]`) so a periodic cleanup job can purge.

For now (Phase 1), the agent **logs created UUIDs** in the run summary under `## Test data created` and the human cleans them up manually. This is a known gap; the cleanup automation is on the roadmap.
