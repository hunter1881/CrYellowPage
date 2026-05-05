# QA system — DirectorioLocal CR

Persistent test artifacts for the `qa-tester` agent. The agent (defined in `.claude/agents/qa-tester.md`, `.github/agents/qa-tester.agent.md`, `.agents/agents/qa-tester.toml`) reads from this folder, runs tests against the live dev/preview site using Playwright MCP and Chrome DevTools MCP, and writes results back here.

This folder is **shared across all three agent systems** (Claude Code, GitHub Copilot, generic AGENTS.md). One source of truth for test plans and test cases — different model frontends, same suite.

---

## Folder layout

```
qa/
├── README.md            ← this file
├── test-plan.md         ← master coverage matrix (read this first)
├── test-cases/
│   ├── smoke/           ← P0 must-pass on every deploy
│   ├── forms/           ← validation, state transitions, error paths
│   ├── flows/           ← multi-page user journeys
│   ├── accessibility/   ← ARIA, keyboard, contrast, screen-reader
│   ├── performance/     ← LCP, INP, CLS, bundle weight
│   └── regression/      ← codified bug fixes (one file per fixed bug)
├── runs/
│   └── YYYY-MM-DD-HHMM/ ← one folder per test run
│       ├── summary.md   ← roll-up: passed, failed, blocked, new
│       └── <id>.result.md  ← per-test result with evidence
└── fixtures/
    ├── test-users.md    ← test accounts and credentials
    └── test-data.md     ← seed assumptions, district/category IDs
```

---

## Test case file format

Every test case is a Markdown file with YAML frontmatter:

```markdown
---
id: TC-SMK-001                          # unique, prefixed by category
title: Home page loads with hero, search, and recent providers
priority: P0                             # P0 | P1 | P2
type: smoke                              # smoke | form | flow | accessibility | performance | regression
tags: [home, indexable]
preconditions:
  - dev server running on http://localhost:4321
  - DB has at least 1 verified provider
created: 2026-05-05
last_run: 2026-05-05
last_status: pass                        # pass | fail | blocked | skipped | new
related_files:
  - src/pages/index.astro
related_bugs: []                         # GitHub issue numbers if any
---

## Objective
What this test verifies and why it matters (1–2 sentences).

## Steps
1. ...
2. ...

## Expected result
- ...
- ...

## Notes
Any context the next runner needs (flaky areas, environment quirks).
```

### ID convention
- `TC-SMK-NNN` — smoke
- `TC-FRM-NNN` — forms
- `TC-FLW-NNN` — flows
- `TC-A11Y-NNN` — accessibility
- `TC-PRF-NNN` — performance
- `TC-RGR-NNN` — regression (paired with a fixed bug)

Numbering is local to each category, zero-padded to 3 digits, and **never reused** even after a test is deleted (history matters in QA).

### Priority
- **P0** — blocks release. Smoke tests + critical-path validations + security.
- **P1** — high-impact bugs, common user paths, data integrity.
- **P2** — edge cases, polish, nice-to-have.

---

## Run results format

After each run, the agent writes:

### `runs/<date>/summary.md`
```markdown
---
date: 2026-05-05T14:30:00-06:00
agent: qa-tester
target: http://localhost:4321
duration_ms: 42137
---

## Roll-up
- 12 passed · 1 failed · 0 blocked · 2 skipped · 1 new bug

## New issues found this run
- 🔴 BUG-001: Provider registration form accepts whitespace-only business name. See TC-FRM-005.result.md.

## Failed tests
- TC-FLW-002: Provider profile shows wrong canton name when slug has accents

## Coverage delta vs last run
+ 1 new test case (TC-FRM-008 added for whitespace edge case)
```

### `runs/<date>/<id>.result.md`
```markdown
---
test_id: TC-FRM-005
status: fail                              # pass | fail | blocked | skipped
duration_ms: 4250
date: 2026-05-05T14:31:22-06:00
---

## Steps executed
1. Navigated to /register-provider — OK
2. Filled "businessName" with "   " (3 spaces) — OK
3. Submitted form — OK
4. Expected: validation error "Nombre requerido". Actual: form accepted, redirected to success page.

## Evidence
- Screenshot: form-state.png
- Network: POST /_actions/registerProvider → 200 (should be 400)
- Console: no errors

## Bug raised
BUG-001 — needs server-side trim + min-length-after-trim validation in the Zod schema.
```

---

## How the agent decides what to test next (autonomy playbook)

The agent is expected to be **self-directing** — to know what's already covered, what's missing, and what just became risky. Three sources feed that decision:

### 1. The coverage matrix in `test-plan.md` is the agent's memory

When the agent writes a new test case, it **must** update `test-plan.md` in the same edit:
- Replace the `❌` cell with the new test ID
- Remove the corresponding item from the "Open work" queue at the bottom
- If the new test reveals a new risk, add a row to the risk register

The matrix is not aspirational — it's an inventory. If `❌` is in a cell, the agent treats it as a real gap to be closed. If a test ID is in a cell, the agent treats it as live coverage and reads that test before adding more.

### 2. Reading run history before running

Before running any test, the agent reads the latest 3 entries in `runs/` for that test ID:
- `flaky: true` in the most recent run → declare flakiness up front; require 2 passes to mark as resolved
- Last run > 30 days ago → flag as "stale", run with elevated attention to environment changes
- Never run → prioritize it; new tests have the highest yield
- Result differs from previous run → investigate before declaring pass/fail (something changed)

### 3. Generating test ideas from code artifacts

A senior QA doesn't wait for someone to file a ticket. They read the code and enumerate what could fail. The agent does the same systematically:

| Artifact | Where to look | Test ideas to generate |
|---|---|---|
| Zod schemas | `src/actions/index.ts`, anywhere `z.object({...})` | For each field: empty, valid, below-min, above-max, whitespace-only, special-char, type-mismatch, locale variants. For each refinement (`.email()`, `.url()`, `.regex()`): try inputs that almost-pass. |
| Astro Actions | `src/actions/` | Happy path, each Zod failure path, network drop mid-submit, double-submit, unauthorized caller, RLS denial. |
| Page routes | `src/pages/` (especially `[param].astro`) | Smoke (200), invalid slug (404), uppercase slug (canonical redirect or 404?), accented slug, empty `getStaticPaths` edge. |
| Queries | `src/lib/queries/` | Happy path, empty result (`[]`), DB error (RPC missing, RLS denied), pagination edge, batch with empty `ids`. |
| RLS policies | `supabase/migrations/*_policies.sql` | For each policy: try as anon, as authenticated-other-user, as authenticated-owner. Each WITH CHECK should reject the corresponding bypass. |
| Custom elements | `src/components/**/*.astro` with `customElements.define` | `connectedCallback` runs once on first render, runs again after View Transitions navigation, properly cleans up listeners. |
| Recent git diff | `git log -20 --name-only` | Any source file in the diff that has zero references in `test-cases/` `related_files` frontmatter is a candidate. |
| TODO comments | `grep -rn "TODO\|FIXME"` in `src/` | Each TODO is an untested risk surface. |
| Performance budgets | `qa/test-plan.md` § Performance budgets | One Lighthouse run per page type per release. |
| Accessibility tree | every page | One `toMatchAriaSnapshot` baseline per page template; future runs compare against it. |

The agent does **not** write a TC for every cell of every artifact — that would be 500 tests of dubious value. It **prioritizes** by:
1. Risk register (high-impact bugs first)
2. Recently changed code (current intent likely under-tested)
3. Critical user paths (browse funnel, registration, login)
4. Cells in the coverage matrix marked `❌` and tagged P0/P1
5. TODO comments and known fragile areas

When in doubt, the agent surfaces a prioritized list of test ideas to the user before writing — not all ideas earn a test.

---

## Agent operating principles (encoded in the agent prompt)

These come from senior QA practice and are non-negotiable:

1. **Read `test-plan.md` first.** Don't repeat work — the matrix shows current coverage.
2. **Risk-based prioritization.** P0 covers happy paths + auth + data integrity. P1 covers common user paths. P2 covers edges.
3. **Equivalence partitioning + boundary values** for every input field.
4. **State transitions** for every form: idle → loading → success | validation-error | server-error.
5. **Persistence verification.** Write data, navigate away, come back, verify it's still there. Cross-page data flow is the highest-value bug surface.
6. **Negative testing.** What happens with empty input, oversized input, malformed input, network failure, race conditions, double-submit.
7. **Resilient locators.** Prefer `getByRole` → `getByTestId` → `getByText` → CSS, in that order.
8. **Web-first assertions.** Always `await expect(locator).toBeVisible()` (auto-wait), never sleep.
9. **Test independence.** Each test must run from a clean state — no test depends on another's side effects.
10. **Evidence on every run.** Screenshot at the moment of assertion; capture console + network on failures.
11. **Codify every bug.** Fixed bug → new entry in `test-cases/regression/`, run on every future suite.
12. **Real DB, not mocks.** Per the project's `.claude/rules/supabase.md` — mocked tests pass while real queries fail. Use the same Supabase the dev server uses; assert against the actual DB state.

---

## How to invoke the agent

### Claude Code
- Explicit invocation: `/agents` → select `qa-tester`. Then prompt with one of:
  - "Run the smoke suite"
  - "Test the provider registration form including edge cases"
  - "Find issues in the home page" (exploratory mode)
  - "Codify a regression test for bug X" (regression mode)
- The agent reads `test-plan.md`, runs the relevant cases, writes results under `runs/`.

### GitHub Copilot
- Open the chat custom-mode picker → `qa-tester`. Same prompt forms.

### Generic AGENTS.md
- Whatever runner reads `.agents/agents/qa-tester.toml` (Cursor, Aider, etc.) will have the same brief.

---

## Maintenance

- After each run, update each touched test case's `last_run` and `last_status` frontmatter.
- When a feature changes, the agent flags affected test cases at the top of the next run summary.
- Old `runs/` folders older than 30 days can be archived/deleted — keep the latest 10 plus any with failures.
- `regression/` is append-only — never delete a regression test (the bug it covers might come back).
