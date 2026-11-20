---
title: Cut List - Build Log
type: ai-project
project: Cut List
note: build-log
date: 2026-11-20
tags: [ai-project, build-log]
---

# Cut List: Build Log

## Process

```mermaid
flowchart LR
  A[Plan] --> B[Engine] --> C[Oracle] --> D[Tests and mutants] --> E[Page] --> F[Browser check] --> G[Document]
```

## Steps

1. Read the playbook, ratings and lessons; chose the cutting-stock problem for its wide audience and checkable claim.
2. Wrote `src/cut.js`: parser, integer ticks, first-fit baseline, exact DP, plan validator.
3. Wrote the generator (400 seeded random jobs, engine answers saved) and a Python oracle that lists every piece separately and runs a subset DP over all 2^n subsets. First run: 0 mismatches. Raised the piece cap from 10 to 13 on a quarter of the cases and re-ran (3 s): still 0.
4. Wrote `test/test.js` (hand-derived cases, parser, all oracle cases, a large case, the honest fallback) and nine mutants.
5. Wrote the page and a Chromium test that reads the drawn boards back out of the DOM.
6. Read screenshots at desktop and phone width.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| Wrong hand-written expectations (cost units, 499+499 with kerf, 3 1/2 x 4 on a 12 in board) | 3 unit failures and 2 browser failures on the first run | Re-derived each from the rule; the engine was right every time | Tests pass |
| A "large" test case took 13 s (72 pieces, 3 board lengths, 399k states) | Test failed on a 4 s limit | Shrank the unit test to 36 pieces (0.26 s); the page gives 3 s then falls back and offers a 30 s search | Slow case is now an honest "not proven" |
| The first-fit baseline opened the shortest board, a straw man (showed 10 boards against 5) | Looked too good when searching for example jobs | Baseline now opens the best cost-per-length board | Fewer, more honest "saves" claims; the oracle sweep was regenerated |
| Default preset showed "first-fit would have matched it" | Screenshot | Searched with the engine for a job where it wins; the "Shelving" preset saves a board | Default shows the point |

## Verification

- `node test/test.js`: 1230 passed, 0 failed.
- `node test/test.js --mutants`: 9 of 9 caught. Mutants 4 to 9 are each caught by only 1 to 6 checks, so they depend on a few checks.
- `python3 test/oracle.py`: 400 cases checked, 0 mismatches (167 where exact beat first-fit; 256 with several board lengths; 170 priced).
- `node test/browser.js`: 24 passed (Chromium, desktop, 375 px width, no console errors).

## Not checked
- Nobody has cut wood from a plan. The kerf rule (pieces on a board need `sum + kerf*(k-1) <= length`) is my model: it ignores squaring-off cuts at the ends of a board and assumes the blade removes the same kerf at every cut.
- The oracle shares that reading of the rule; it checks the optimisation, not the model.
- Only Chromium; no Firefox or Safari; print layout not looked at.
- No real job above 14 piece types was tried; the fall-back path was exercised with one 112-piece case that really did time out (3.2 s).
- Prices are plain numbers; no currency or tax handling.
- Fractions finer than 1/64 in or 0.1 mm are rounded, not rejected.

Related: [[Cut List]]
