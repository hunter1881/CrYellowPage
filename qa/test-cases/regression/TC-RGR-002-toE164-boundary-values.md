---
id: TC-RGR-002
title: toE164 phone-number normalizer handles all CR phone formats correctly
priority: P1
type: regression
tags: [phone, e164, helper, regression, white-box]
preconditions:
  - dev server running on http://localhost:4321
  - Node 20+ available (for npx tsx)
created: 2026-05-05
last_run: 2026-05-05
last_status: pass
related_files:
  - src/lib/phone.ts
  - src/lib/seo/localBusiness.ts
  - src/components/directory/ProviderContactBox.astro
related_bugs:
  - 'BUG-003 (TC-SMK-002 run 2026-05-05): tel: link missing +506 country code; LocalBusiness.telephone not E.164. Fix introduced toE164() helper in src/lib/phone.ts.'
---

## Objective

Verify `toE164(phone: string): string` normalizes Costa Rica phone numbers to E.164 (`+506XXXXXXXX`) for every input variation that providers (and the seed) actually produce, and **document the helper's behavior on degenerate inputs** so future changes don't silently regress one of its two consumers (JSON-LD telephone + `tel:` href).

This is the white-box companion to TC-SMK-002 sub-test C (which only verifies that the wired-up output is correct for one seed provider).

## Note on E.164 attribution

Schema.org does **not** mandate E.164 for `LocalBusiness.telephone` (verified via context7 against `/schemaorg/schemaorg` 2026-05-05: examples use national format like `"850-648-4200"`). The E.164 requirement is from **Google Search rich results guidelines**, not the Schema.org spec. The helper's purpose is Google compatibility, not structural compliance with Schema.org. Phrase any failure as "Google rich results convention violated", not "Schema.org spec violated".

## Phase A — Unit-style test of the helper's input/output contract

### Steps

1. From the project root, run:

```bash
npx --yes tsx -e "
import { toE164 } from './src/lib/phone.ts'
const cases = [
  // [input, expected, label]
  ['8712-4490',          '+50687124490',  'CR national format with dash (seed format)'],
  ['+506 8712-4490',     '+50687124490',  'already E.164 with space and dash'],
  ['506 8712 4490',      '+50687124490',  'CR with country code, spaces only'],
  ['50687124490',        '+50687124490',  'all digits, no formatting'],
  ['+50687124490',       '+50687124490',  'pure E.164 already'],
  ['8712.4490',          '+50687124490',  'period separator'],
  ['(8712) 4490',        '+50687124490',  'parens'],
  ['',                   '+506',          'EMPTY input (degenerate — flags need for hardening)'],
  ['abc',                '+506',          'NON-DIGIT only (degenerate)'],
  ['506',                '+506506',       'short input starting with 506 (degenerate — double-prefixed)'],
  ['5068712',            '+5065068712',   'short 506-prefixed (degenerate — double-prefixed)'],
]
let pass = 0, fail = 0
for (const [input, expected, label] of cases) {
  const got = toE164(input)
  const ok = got === expected
  console.log((ok ? 'PASS' : 'FAIL') + ' · ' + label + ' | in=' + JSON.stringify(input) + ' exp=' + expected + ' got=' + got)
  ok ? pass++ : fail++
}
console.log('Total: ' + pass + '/' + cases.length + ' passed')
process.exit(fail > 0 ? 1 : 0)
"
```

2. Capture stdout to the run result file.

### Expected (Phase A)

- Cases 1–7 (valid CR phone formats): all pass with `+50687124490`
- Cases 8–11 (degenerate inputs): pass per the **documented current behavior**:
  - Empty / garbage → `+506` (incomplete, dialer can't use — landmine for unvalidated user input)
  - Short input starting with `506` → double-prefixed `+506506...` (also incomplete)

These are NOT bugs for the intended use case (helper is always called with seed-validated provider phones). They become bugs the day someone calls `toE164` with unvalidated user input. **Recommendation in the run summary**: if `toE164` is ever exposed to user input (e.g., the registration form), wrap it with a validator OR change the helper to throw on invalid input. Open a follow-up TC then.

## Phase B — Wiring verification (helper is actually called by both consumers)

3. Run `grep -rn "toE164" src/` — must show usages in `src/lib/seo/localBusiness.ts` and `src/components/directory/ProviderContactBox.astro` at minimum
4. Open `http://localhost:4321/proveedor/00000000-0000-4000-8000-000000000301-don-rafa-fontaneria` in the dev server via Playwright MCP
5. Read the JSON-LD `LocalBusiness.telephone` value via `mcp__playwright__browser_evaluate`:
   ```js
   () => {
     const ld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
       .map((s) => JSON.parse(s.textContent ?? '{}'))
       .find((j) => j['@type'] === 'LocalBusiness')
     return ld?.telephone
   }
   ```
6. Read the `tel:` href via:
   ```js
   () => document.querySelector('a[href^="tel:"]')?.getAttribute('href')
   ```

### Expected (Phase B)

- Step 3: `toE164` referenced in both `localBusiness.ts` and `ProviderContactBox.astro`
- Step 5: `telephone` value equals `"+50687124490"` (NOT `"8712-4490"`)
- Step 6: `tel:` href equals `"tel:+50687124490"` (NOT `"tel:8712-4490"`)

If either the JSON-LD or the `tel:` href shows a non-E.164 value, the helper is broken OR a consumer is bypassing it — both are P1 regressions.

## Notes

- Pairs with TC-SMK-002 sub-test C (empirical end-to-end). This TC is the white-box companion: it tests the helper's input/output contract directly so a future refactor can't silently regress one of the call sites without the other.
- This project does NOT have Vitest installed. Phase A uses `npx --yes tsx -e` to run an inline TS evaluation — npm fetches `tsx` on demand. If a test runner is later installed, port Phase A to it for cleaner output.
- If the helper signature changes (e.g., to return `null` on invalid input), this test must be updated alongside the call sites — they're a triple, not three independent surfaces.
- Future enhancement candidate: add `validatePhone(input: string): boolean` to `phone.ts` that returns false for the degenerate cases (empty, < 8 digits, non-digit chars). Would unlock proper form validation in the registration Action and let `toE164` throw on invalid input rather than silently producing `+506`.

## Test data created

None — read-only test.
