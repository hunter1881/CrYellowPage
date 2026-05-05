---
id: TC-RGR-003
title: Zod schema strips Unicode format characters before length validation (ZWSP bypass)
priority: P0
type: regression
tags: [registration, zod, validation, unicode, security]
preconditions:
  - dev server running on http://localhost:4321
  - service-role access to verify DB rows are NOT inserted on rejection
created: 2026-05-05
last_run: 2026-05-05
last_status: pass
related_files:
  - src/actions/index.ts
  - src/components/directory/ProviderRegistrationForm.astro
related_bugs:
  - 'BUG-001 (qa-tester exploratory run 2026-05-05): zero-width spaces (U+200B) bypass z.string().trim().min(3). Evidence row: bad19e76-6270-4cfd-bb0b-654853ff62d2 in provider_registrations.'
---

## Objective

Verify the registration Zod schema rejects names/descriptions composed entirely of Unicode format characters (zero-width spaces, joiners, BOMs, etc.) which JavaScript `.trim()` does NOT strip. The fix introduced a `cleanText()` helper + `requiredText()` factory that runs `replace(/\p{Cf}/gu, '')` BEFORE trimming and length checking.

This bug class affects the entire surface where text is validated: a malicious or buggy client could submit names that look empty in any UI but pass server validation. This regression test ensures the helper is applied to every text field that has a `min` constraint.

## Why this matters

The qa-tester exploratory run inserted a registration with `business_name = "​​​"` (3 zero-width spaces). The row appeared in `provider_registrations` with `status = 'pending'`. If an admin approved it without inspecting Unicode codepoints, a provider with a visually-empty name would publish on the public directory — invisible link in listings, broken JSON-LD, no way to attribute reviews.

## Steps

### Phase A — schema-level rejection

For each of the following inputs, fill the form with otherwise-valid data and submit. Use `mcp__playwright__browser_evaluate` to set the value programmatically (UI input may strip the chars in some browsers):

1. `businessName = "​​​"` (3 zero-width spaces) — expect rejection: "Nombre del negocio: mínimo 3 caracteres."
2. `businessName = "​​ab"` (2 ZWSP + 2 letters; cleaned length = 2) — expect rejection (cleaned length below min 3)
3. `businessName = "​abc​"` (ZWSP padded actual content; cleaned = "abc") — expect acceptance (cleaned length = 3)
4. `contactName = "‌‍‎"` (zero-width joiners + LRM) — expect rejection
5. `description = ` 30 zero-width spaces — expect rejection (cleaned = empty, below min 30)
6. `description = "Servicio de fontanería profesional con 18 años​​"` — expect acceptance (cleaned length still ≥ 30)

For each rejection case, verify:
- Server response is `400 Bad Request`
- Error message in Spanish (NOT raw English Zod default)
- NO row inserted in `provider_registrations` (check via service-role query for the timestamp window)

### Phase B — helper unit-level test

Run the cleanText helper directly against the same inputs:

```bash
npx --yes tsx -e "
const cleanText = (v) => v.replace(/\p{Cf}/gu, '').trim()
const cases = [
  ['​​​', '', 'all ZWSP'],
  ['​​ab', 'ab', 'partial cleaned to 2'],
  ['​abc​', 'abc', 'cleaned to abc'],
  ['  hello  ​', 'hello', 'whitespace + ZWSP'],
  ['plain text', 'plain text', 'no format chars'],
  ['﻿start', 'start', 'BOM at start'],
  ['', '', 'empty input'],
]
let pass = 0, fail = 0
for (const [input, expected, label] of cases) {
  const got = cleanText(input)
  const ok = got === expected
  console.log((ok ? 'PASS' : 'FAIL') + ' · ' + label + ' | got=' + JSON.stringify(got))
  ok ? pass++ : fail++
}
process.exit(fail > 0 ? 1 : 0)
"
```

### Phase C — defense-in-depth at DB level

7. Verify the existing `business_name = btrim(business_name)` CHECK constraint still rejects raw whitespace at insert time:
   - Attempt direct insert via service-role with `business_name = "  hello  "` (whitespace padded, NOT cleaned by Zod since this bypasses the action)
   - Expect: insert fails with check_violation (Postgres error code 23514)

This confirms the layered defense: Zod cleans at the application layer, btrim CHECK guards at the DB layer for callers that bypass the action.

## Expected result

- Phase A cases 1, 2, 4, 5: HTTP 400 with Spanish error message; no DB row
- Phase A cases 3, 6: HTTP 200; DB row created with cleaned text (no ZWSP)
- Phase B: all 7 unit cases pass — `cleanText` strips format chars + trims
- Phase C: bypass attempt rejected by Postgres CHECK

## Test data created

Phase A cases 3 and 6 will create real `provider_registrations` rows with `status='pending'`. Log their UUIDs in the run summary for cleanup.

## Notes

- The `\p{Cf}` Unicode property class covers all "Format" characters (Cf): zero-width spaces (U+200B/C/D), bidi marks (U+200E/F, U+202A-E, U+2066-9), BOM (U+FEFF), and others. This is broader than just ZWSP and catches the whole class.
- The qa-tester exploratory run found this in the registration form. The same fix in `requiredText()` is reused by `submitReview` — that path is separately covered when TC-FRM-002 (review form coverage) is written.
- If a future refactor removes the `cleanText()` call from any field, this test fails fast.
