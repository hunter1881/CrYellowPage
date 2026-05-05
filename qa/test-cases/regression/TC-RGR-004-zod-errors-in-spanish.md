---
id: TC-RGR-004
title: Form validation errors render in Spanish, not raw English Zod defaults
priority: P0
type: regression
tags: [registration, zod, i18n, ux, spanish]
preconditions:
  - dev server running on http://localhost:4321
created: 2026-05-05
last_run: 2026-05-05
last_status: pass
related_files:
  - src/actions/index.ts
  - src/components/directory/ProviderRegistrationForm.astro
  - src/pages/register-provider.astro
related_bugs:
  - 'BUG-002 (qa-tester exploratory run 2026-05-05): every Zod field-level error rendered in raw English ("Too small: expected string to have >=3 characters", "Invalid input: expected string, received null", etc.). Violates project Rule 15 (Spanish UI = Spanish error messages).'
---

## Objective

Verify that every validation error from the registration form appears in Spanish — not the raw English Zod defaults that the user sees when no `{ message: "..." }` is provided in the schema. The fix added explicit Spanish messages to every refinement in `src/actions/index.ts`. This regression catches future schema changes that forget to localize.

This is also a regression for the `submitReview` schema, which received the same treatment.

## Why this matters

Project rule 15: "Spanish UI = Spanish error messages." Users in Costa Rica using a Spanish UI should never see "Too small: expected string to have >=3 characters" — it breaks trust, looks unprofessional, and is unreadable for non-English speakers (the primary audience).

Beyond UX: English errors are a tell that internal code is leaking into the user-facing layer. Reviewers should see this as a smell, not a feature.

## Steps

### Phase A — every required-field rejection has a Spanish message

For each row in the table, fill the form with the trigger input + otherwise-valid data, submit, and read the rendered error text via `mcp__playwright__browser_evaluate`:

```js
() => Array.from(document.querySelectorAll('[class*="text-clay"], .text-error, [data-error]'))
  .map((el) => el.textContent?.trim())
  .filter(Boolean)
```

| Field | Trigger input | Expected Spanish substring (any of these) |
|---|---|---|
| `businessName` | empty | `mínimo 3 caracteres` |
| `businessName` | `"ab"` (2 chars) | `mínimo 3 caracteres` |
| `businessName` | `"a".repeat(121)` | `máximo 120 caracteres` |
| `contactName` | empty | `mínimo 3 caracteres` |
| `phone` | `"abc"` | `Teléfono inválido` |
| `email` | `"not-email"` | `Correo electrónico inválido` |
| `email` | 161-char string | `demasiado largo` OR `máximo` |
| `districtId` | not selected (form submit with empty hidden input) | `Seleccione un distrito` |
| `categoryIds` | submit with 0 categories | `al menos una categoría` |
| `categoryIds` | inject 5 via `form.requestSubmit()` after JS-bypass of UI cap | `Máximo 4 categorías` |
| `description` | `"a".repeat(29)` | `mínimo 30 caracteres` |
| `description` | `"a".repeat(501)` | `máximo 500 caracteres` |

For each row:
- The error must NOT contain English keywords: `"expected"`, `"received"`, `"too small"`, `"too big"`, `"invalid input"`, `"string"` (in error context)
- The error MUST contain Spanish content matching the table

### Phase B — `submitReview` schema (when review form lands in production)

Repeat the same pattern for the review form once `TC-FRM-002` is implemented. Required Spanish substrings:
- `rating` empty → `Seleccione una calificación`
- `comment` empty → `mínimo 1 caracteres` (Spanish)
- `workConfirmed` empty → `Confirme si recibió el servicio`

Mark this phase as `skipped` if review form isn't yet wired up — note the deferral in the run summary.

### Phase C — global pattern check

Grep the rendered HTML of the form-error state for English Zod telltales:

```bash
curl -s http://localhost:4321/register-provider \
  -X POST --data-urlencode "businessName=" --data-urlencode "phone=abc" \
  | grep -iE "expected|received|too small|too big|invalid input"
```

Expected: empty output. Any match is a regression.

## Expected result

- Phase A: every row triggers an error with the expected Spanish substring; zero rows show English keywords.
- Phase B: ditto for review form (or `skipped` if not yet implemented).
- Phase C: no English Zod telltales in any error response.

## Notes

- The fix lives in `src/actions/index.ts` via two patterns:
  1. `requiredText(label, min, max)` factory adds Spanish messages for `min`/`max` violations
  2. Inline `{ message: "..." }` arguments on each remaining refinement
- Translation table is co-located with the schema (not in `i18n.ts`) — that's intentional for now since errors are server-side validation messages, not UI strings. If we ever localize for English-language URLs, refactor to a per-locale error map.
- Future enhancement: add a CI lint that grep-greps `src/actions/**` for Zod schemas missing `{ message: ... }` arguments. Caught at PR time, not in QA.
