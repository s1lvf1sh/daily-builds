---
title: Dice Duel - Build Log
type: ai-project
project: Dice Duel
note: build-log
date: 2026-11-27
tags: [ai-project, build-log]
---

# Dice Duel: Build Log

## Process

```mermaid
flowchart LR
  A[Plan] --> B[Build] --> C[Measure] --> D[Tune] --> E[Verify] --> F[Document]
```

## Steps

1. Read the playbook, the ratings, the lessons and the feedback notes; chose dice odds because it is reusable and has a clean independent oracle.
2. Wrote the engine (`src/dice.js`): tokenizer, recursive descent parser, keep/drop dynamic programme, duel and target odds, sampler.
3. Checked it by hand against two published numbers (12.2446 and 13.825) before writing tests.
4. Wrote the Python brute-force oracle and the Node tests.
5. Built the page, then a Playwright test and read desktop and phone screenshots.
6. Ran 15 hand-made mutants against the tests.
7. Wrote the notes and the rating, and ran the site test.

## Problems and fixes

| Problem | How it showed up | Change | Result |
|---|---|---|---|
| Oracle ignored `*` precedence | First run: 1 oracle test failed on `d12+4*6` | Rewrote the oracle's generator as sums of products | 360 cases match |
| Mean off by 5e-8 | An exact-looking `2d6+1` mean gave 7.99999995 | Truncating each probability to 9 digits lost accuracy; the mean is now summed exactly in BigInt and divided once | Within 1e-12 |
| Tests used exact float equality | 7.174999999999999 vs 7.175 | Tolerance of 1e-12 | Pass |
| Wrong expected total in the browser test | 8000 outcomes, not 160000 | Fixed the test (my arithmetic, not the page) | Pass |
| Mutation script mis-split on `=>` | Two mutants appeared to survive | Changed the delimiter and re-ran | Both caught |
| Spread mutant genuinely survived | No test read the standard deviation | Added a test (sd of d6 and 2d6) | Caught |
| "1 in 1.0" for a 96% chance | Seen in the screenshot | Two decimals under 10 | Now 1 in 1.04 |

## Verification

- `node --test test/dice.test.mjs`: 9 pass, 0 fail. The oracle test checks 360 cases.
- `node test/browser.mjs`: 14 ok, including 1000 real rolls (A won 414; exact expectation 398 plus or minus 15) and no console errors.
- 15 of 15 mutants caught after the added spread test: keep order, kept count, binomial weight, drop mapping, drop count, precedence, subtraction, negation, tie handling, at-least boundary, `d%`, spread, size cap, sampler boundary, unary minus.
- `node --test test/site.test.mjs`: 19 pass.
- Screenshots read at 1000 px and 375 px wide.

## Not verified

- No other browser (Firefox, Safari) and no real phone, only a narrow Chromium viewport.
- No person used it.
- Screen reader behaviour was not tested; I added labels and live regions without trying them.
- The sampler's quality is only tested by a chi-square on one distribution.
- Ties between a pair of very large pools were not cross-checked beyond what the oracle's size allows (up to about 3 million outcomes).

Related: [[Dice Duel]] · [[Dice Duel - Origin & Decisions]] · [[Dice Duel - Lessons & Observations]]
