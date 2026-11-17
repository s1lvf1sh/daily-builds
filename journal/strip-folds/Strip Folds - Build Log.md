---
title: Strip Folds - Build Log
type: ai-project
project: Strip Folds
note: build-log
date: 2026-11-17
tags: [ai-project, build-log]
---

# Strip Folds: Build Log

## Process

```mermaid
graph LR
A[Choose] --> B[Engine] --> C[A000136 check] --> D[Python oracle] --> E[Fix rule] --> F[Page] --> G[Browser test] --> H[Document]
```

## Steps
1. Wrote `src/fold.js`: vertex positions, the mountain/valley above-or-below rule, the insertion search, a separate full `verify()`, parsing, the dragon sequence and the 90-degree curve.
2. First run: summing counts over all unit M/V patterns gave 1, 2, 6, 16, 50, 144, 462, 1392, 4536 for 1 to 9 segments. That matches A000136, so the unit case was right on the first try.
3. Wrote `test/oracle.py` (permutation brute force, ellipse-arc geometry) and generated 387 cases: every unit strip to 7 segments plus 260 random strips with lengths 1 to 3 and up to 8 segments.
4. **What went wrong:** 22 of 387 cases disagreed, all with unequal lengths. Cause: my engine blocked a fold only when the fold position was strictly inside another segment. But a segment that starts exactly at the fold position and extends to the side the fold bulges also gets pierced. Unit strips never exercise that, which is why the published numbers passed. Fix: a side-aware test (`inLoop`) used in both the search and `verify()`. After that all 387 agree.
5. Added mutation runs (6 mutants), the page, and a Chromium test.
6. Browser test failures: two preset buttons made false claims. "Will not fold" used `VMVM` with unit lengths, which does fold, and "Odd lengths" was unfoldable. I found replacements with the engine (`VVV` with `2 3 1 2`, and `VMMV` with `2 1 3 1 2`) and the oracle independently confirms 0 and 6 foldings. Also an input-error path crashed the page (`cr.creases` undefined) and the unfoldable case crashed the drawing (no orders); both fixed. Two test mistakes (error regex, stale `page.url()` after `replaceState`) were mine.

## Checks run
- `node test/test.js`: 37 pass. Includes A000136 for n=1..10, the 387-case oracle sweep, `verify()` brute force over all permutations for 251 small cases, every listed folding re-verified (more than 500 stackings), 12-crease unit strips sampled, parsing, the dragon sequence and curve.
- Mutants: 6 of 6 caught (flip mountain/valley parity, drop the bulge-side rule, drop one interleave case, ignore alternation of direction, off-by-one in the search range, wrong dragon sequence). One mutant failed 1 check only, but failed.
- `node test/browser.js`: 21 pass in headless Chromium: presets make their claims, navigation, error messages, share link restore, 30-crease strip, no horizontal scroll at 375 px, no console errors.

## What was NOT checked
- Only Chromium. No Firefox or Safari.
- The oracle uses the same physical model idea (folds bulge away from paper, segment pierced if in the loop). If that model is wrong for real paper, both are wrong together. The published numbers cover only unit lengths.
- Real paper thickness is ignored (the model is infinitely thin).
- The dragon curve at 90 degrees is checked only for edge reuse, not against an outside drawing.
- Counts above about 10^5 are lower bounds (search node cap); I did not verify any large count independently.
- The phone layout was only checked for horizontal overflow, not viewed.
