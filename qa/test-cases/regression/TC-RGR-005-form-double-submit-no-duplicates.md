---
id: TC-RGR-005
title: Double-submit (rapid clicks or form.requestSubmit×2) does not create duplicate provider_registrations rows
priority: P0
type: regression
tags: [registration, idempotency, double-submit, defense-in-depth]
preconditions:
  - dev server running on http://localhost:4321
  - service-role access to count rows in provider_registrations
  - Postgres unique index `provider_registrations_email_pending_unique` applied (migration 20260505220000)
created: 2026-05-05
last_run: 2026-05-05
last_status: pass
related_files:
  - src/layouts/BaseLayout.astro
  - src/lib/queries/providerRegistrations.ts
  - src/actions/index.ts
  - supabase/migrations/20260505220000_provider_registration_email_unique.sql
related_bugs:
  - 'BUG-003 (qa-tester exploratory run 2026-05-05): form.requestSubmit() called twice synchronously created two pending rows for the same email. Evidence UUIDs: 8d3dfc9b-a2de-45e6-a5c2-df5e487e964c and 6ae765e2-a347-4030-84d9-adc127ac2654.'
---

## Objective

Verify that the registration form cannot create more than one pending application per email through any of these vectors:
1. **Rapid double-click** on the submit button (most common: impatient user)
2. **`form.requestSubmit()` called twice** in the same JS tick (script or programmatic submission)
3. **Two simultaneous network requests** with the same payload (race condition or direct API call)

The fix is layered (defense-in-depth):
- **Layer 1 (browser)**: re-entry guard in `BaseLayout.astro` submit listener — second submit `event.preventDefault()`s
- **Layer 2 (DB)**: partial unique index `(email) WHERE status='pending'` in migration `20260505220000` — second insert raises Postgres error 23505
- **Layer 3 (action)**: handler catches 23505 and returns Spanish CONFLICT error

A regression in any single layer is recoverable by the next layer down. A regression in ALL THREE creates the original bug.

## Why this matters

Duplicate pending registrations:
- Pollute the admin queue (admin sees "John Plumber" twice and has to dedupe by hand)
- Risk approving both rows → two `providers` rows for the same business → SEO penalty (duplicate content), confusing user-facing UI
- Surface a class of bugs where idempotency wasn't designed in — once fixed, every future mutation should follow this pattern

## Steps

### Phase A — Rapid double-click (Layer 1 alone)

1. Navigate to `/register-provider`
2. Fill all fields with valid data, email = `dup-test-1@directoriolocal.test`
3. Capture the submit button via `mcp__playwright__browser_evaluate` and bind a click counter
4. Click submit twice in rapid succession (within 50ms — use `mcp__playwright__browser_click` twice without delay)
5. Wait for navigation to complete

**Expected**: exactly one row in `provider_registrations` with this email. Layer 1 (button.dataset.dlSubmitting guard) blocks the second click.

### Phase B — `form.requestSubmit()` × 2 (the original bug repro)

6. Navigate to `/register-provider` (fresh — no cookies/state from Phase A)
7. Fill all fields, email = `dup-test-2@directoriolocal.test`
8. Inject and run via `mcp__playwright__browser_evaluate`:
   ```js
   () => {
     const form = document.querySelector('form')
     form.requestSubmit()
     form.requestSubmit() // second call should be a no-op due to dlSubmitting guard
   }
   ```
9. Wait 2 seconds for both requests to (potentially) complete

**Expected**: exactly one row inserted. The Layer 1 guard intercepts the second `requestSubmit` and calls `preventDefault()` on it.

### Phase C — Direct API double-POST (Layer 1 bypassed; Layers 2+3 must catch it)

10. Construct two identical POST requests via `fetch()` to the action endpoint with the same payload (email = `dup-test-3@directoriolocal.test`):
    ```js
    () => {
      const formData = new FormData()
      // ... populate with valid registration data, same email
      const url = '/_actions/registerProvider'
      return Promise.allSettled([
        fetch(url, { method: 'POST', body: formData }),
        fetch(url, { method: 'POST', body: formData }),
      ]).then((results) => results.map((r) => r.status))
    }
    ```
11. Inspect the responses:
    - One should succeed (HTTP 200 with `{ id }`)
    - The other should fail with HTTP 409 CONFLICT and Spanish message `"Ya tenemos una solicitud pendiente con este correo electrónico."`

**Expected**: exactly one row inserted (Layer 2's unique index blocks the second; Layer 3's handler returns 409 with friendly message).

### Phase D — Re-application after rejection (the partial-index semantics)

12. As a service-role admin, find the row from Phase A and update `status = 'rejected'`
13. Submit a new registration with the same email (`dup-test-1@directoriolocal.test`)

**Expected**: HTTP 200, new row created. The partial index `WHERE status = 'pending'` only constrains pending rows — once the previous one moves to `rejected`, the email is freed up. Confirms intended UX.

## Expected result

- **Phase A**: 1 row, browser blocks second click via Layer 1
- **Phase B**: 1 row, browser blocks second `requestSubmit` via Layer 1
- **Phase C**: 1 row, DB blocks second insert via Layer 2; user sees Spanish CONFLICT message via Layer 3
- **Phase D**: 1 NEW row, partial-index semantics allow re-application after rejection

Total rows created across all phases: 4 (Phases A/B/C contribute 1 each, Phase D contributes 1). Verify via:

```sql
select id, email, business_name, status, created_at
from provider_registrations
where email like 'dup-test-%@directoriolocal.test'
order by created_at;
```

## Test data created (cleanup required)

| Phase | Email | Notes |
|---|---|---|
| A | `dup-test-1@directoriolocal.test` | One row, status=pending → moved to rejected during Phase D |
| B | `dup-test-2@directoriolocal.test` | One row, status=pending |
| C | `dup-test-3@directoriolocal.test` | One row, status=pending |
| D | `dup-test-1@directoriolocal.test` | New row after re-application; status=pending |

Delete via service-role after run completes.

## Notes

- This test exercises three independent defense layers. If a future refactor disables one (e.g., removes the JS guard), the test still passes (the DB layer catches the bypass) but the run summary should flag the layer regression so the user knows defense-in-depth is reduced.
- The Phase D semantics (re-application after rejection) is INTENDED — partial unique index. If a future migration changes to `WHERE status IN ('pending', 'rejected')`, this phase will fail and the test must be updated alongside the migration.
- For the action `_actions/registerProvider` URL pattern in Phase C: this is the Astro Actions endpoint convention. Verify against the actual generated route name if Astro changes its convention.
