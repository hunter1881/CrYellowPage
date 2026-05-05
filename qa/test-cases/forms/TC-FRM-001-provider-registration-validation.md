---
id: TC-FRM-001
title: Provider registration form rejects invalid input with clear errors
priority: P0
type: form
tags: [registration, validation, zod, district-autocomplete, chip-select]
preconditions:
  - dev server running on http://localhost:4321
  - at least 1 canton + district + category + payment method exist in DB
created: 2026-05-05
last_run: null
last_status: new
related_files:
  - src/pages/register-provider.astro
  - src/components/directory/ProviderRegistrationForm.astro
  - src/actions/index.ts
  - src/components/ui/ChipSelect.astro
related_bugs: []
---

## Objective

Verify that the provider registration form **rejects every class of invalid input** with localized Spanish error messages, that valid input creates a `providers` row with `verified=false`, and that the custom-element components (`<district-autocomplete>`, `<chip-select>`) work correctly.

This form is the **only** mutation flow into the directory. If validation breaks, we either reject legitimate providers (conversion loss) or accept spam/malformed data (data integrity loss).

## Steps

### Setup
1. Navigate to `http://localhost:4321/register-provider`
2. Wait for `astro:page-load`
3. Verify form is visible (`form[method="POST"]`)

### Equivalence partition: empty submit
4. Click the submit button without filling anything
5. Verify: form does NOT navigate, error messages appear next to required fields, focus returns to the first invalid field

### Boundary value: business name length
6. Fill `businessName` with `"ab"` (below `minlength=3`) → submit → expect validation error
7. Fill `businessName` with `"a".repeat(120)` (exactly `maxlength=120`) → expect accepted
8. Fill `businessName` with `"a".repeat(121)` → expect HTML5 `maxlength` truncation OR server-side rejection

### Whitespace-only required field
9. Fill `businessName` with `"   "` (3 spaces) → submit → expect validation error (whitespace-only must not pass `min(3)`)
10. Fill `businessName` with `"  ab  "` (padded with whitespace) → submit → expect either acceptance after trim, or rejection — whichever the Zod schema does, document the actual behavior here

### Email format
11. Fill `email` with `"not-an-email"` → submit → expect "email inválido" error
12. Fill `email` with `"user@"` → expect error
13. Fill `email` with `"user@example.com"` → expect accepted

### Phone format
14. Fill `phone` with `"abc"` → expect rejection
15. Fill `phone` with `"8888-8888"` (CR format) → expect accepted

### District autocomplete (`<district-autocomplete>` custom element)
16. Type `"vuelta"` in the district input → dropdown appears with at least one option containing "Vuelta de Jorco"
17. Click the option → input shows `"Vuelta de Jorco, Aserrí"`, hidden `districtId` field has a UUID, border turns canopy-green
18. Clear the input → hidden `districtId` clears
19. Type `"xyz123"` (no matches) → dropdown hides
20. Submit form without picking a dropdown option (typed text only) → expect validation error on `districtId` since it's empty

### Categories (`<chip-select>` custom element, max 4)
21. Click the category input → dropdown opens with available categories
22. Pick 1 category → chip appears, hidden input present
23. Pick 4 more → only the 5th attempt is silently ignored (max=4 enforced client-side)
24. Click the ✕ on a chip → chip and hidden input both removed
25. Submit with 0 categories selected → expect validation error

### Payment methods (`<chip-select>`, max 11, optional)
26. Pick 0 → submit → expect accepted (field is optional)
27. Pick 11 → all chips visible
28. Try to pick a 12th → silently ignored

### Honeypot
29. Fill the hidden `website` field via `mcp__chrome-devtools__evaluate_script`: `document.querySelector('input[name="website"]').value = 'spam.com'`
30. Submit with otherwise-valid data → expect server returns success-looking response BUT no row inserted in DB (silent reject)

### Happy path — full valid submit
31. Fill every required field with valid data
32. Submit
33. Verify: redirect to confirmation page (`/account` or success route)
34. Query Supabase: a new `providers` row exists with `verified=false`, `owner_id=null`, district_id matches the picked district, and the categories junction table has the 1+ rows
35. Take screenshot of confirmation state

### Double-submit
36. Reload the form, fill again, click submit twice within 100ms (use `mcp__playwright__browser_evaluate` to dispatch two `requestSubmit` events back-to-back)
37. Verify: only ONE row inserted (Astro Action should be idempotent OR the button should disable on first click)

## Expected result

- Every invalid input class produces a Spanish error message in the corresponding field
- No 500 errors in the network log
- No console errors except those explicitly thrown by validation
- Custom elements (`<district-autocomplete>`, `<chip-select>`) initialize on `connectedCallback` and respond to user input
- Happy-path submission creates exactly one `providers` row with `verified=false`
- Honeypot fills cause silent reject (HTTP 200 response, no DB write)
- Double-submit creates at most one row

## Notes

- The custom elements were refactored from `<script is:inline>` to bundled custom elements. Watch for regression: opening the form twice in the same SPA navigation must still work (custom element should re-init on `connectedCallback`).
- The whitespace-only behavior (step 10) depends on whether Zod schema uses `.trim().min(3)` or `.min(3)`. The test should record actual behavior on first run and codify the expectation.
- For the DB assertion (step 34), use the project's `@lib/supabase` client with the anon key; the row should be readable because RLS allows public read on `providers` regardless of `verified` (correction needed if the RLS policy was tightened).
