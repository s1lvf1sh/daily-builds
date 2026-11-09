---
title: Even Split - Build Log
type: ai-project
project: Even Split
note: build-log
date: 2026-11-09
tags: [ai-project, build-log]
---

# Even Split: Build Log

## Process

```mermaid
flowchart LR
  A[Plan] --> B[Build core] --> C[Oracle + sweep] --> D[Mutate] --> E[Page] --> F[Browser check] --> G[Document]
```

## Steps

1. Read the playbook and past notes; chose settle-up.
2. Wrote `src/split.js` (parser, allocation, balances, settle) as a module usable from Node and the page.
3. Wrote `test/test.js` (units and a 400-case sweep) and `test/oracle.py`.
4. Mutated the code twice to confirm the tests can fail.
5. Built `index.html`, drove it with Playwright, and read desktop and mobile screenshots.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| Mutation hung the run | Oracle search looped forever when balances did not sum to 0 | Oracle skips the search when the sum is nonzero (already reported) | Mutation now fails fast |
| Sweep too weak | Greedy-only mutation failed only a hand-written unit test | Added clustered cases (two disjoint groups) to the generator | Oracle now catches it (e.g. JS 4 vs oracle 3) |
| Browser test failed on "Settle up" | CSS uppercase changes `innerText` | Case-insensitive check | Passed (test bug, not page bug) |
| Hash restore test failed | Same-document `goto` then reload in the test | Reload only | Passed; a tiny separate script confirmed the page itself was right |

## Verification

- `node test/test.js`: 2734 passed, 0 failed, including `oracle: 400 cases, 0 failures`.
- Mutation 1 (lose one remainder cent): 636 failures. Mutation 2 (no exact search): oracle reported count mismatches. Both restored; final run green.
- `node test/browser.js`: 12 passed. Screenshots at 1000px and 390px were read.

## Not verified

- No other browser than Chromium; no real phone.
- The oracle's "clear one person per payment" lemma is assumed, not proven here.
- Decimal weights (`ana:1.5`) and `all except` are unit-tested only.
- The greedy fallback for more than 18 people was checked for settling everyone, not for quality.
- No comparison with any real expense app's rounding.
- Nobody else has used it.

Related: [[Even Split]] · [[Even Split - Origin & Decisions]] · [[Even Split - Lessons & Observations]]
