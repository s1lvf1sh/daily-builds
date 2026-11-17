# Strip Folds

Write mountain (M) and valley (V) creases along a strip of paper, optionally with unequal segment lengths. The page tells you whether the strip folds flat, how many stacking orders work, shows each one in a side view, and draws the strip opened to right angles (the dragon curve appears for the repeated-fold pattern).

Live: https://s1lvf1sh.github.io/daily-builds/builds/strip-folds/

## Run
Open `index.html` (static, no build, no network). State is kept in the URL hash.

## Test
- `node test/test.js`: 37 checks, under a second.
- `MUTANT=1..6 node test/test.js`: runs a deliberately broken engine; each should fail.
- `NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js`: 21 checks in headless Chromium.
- `cd test && python3 oracle.py gen`: regenerates `oracle_cases.json` (a few minutes at most).

## How it is checked
- Published numbers: summed over all M/V patterns of unit strips, the counts for 1 to 10 segments are 1, 2, 6, 16, 50, 144, 462, 1392, 4536, 14060 (OEIS A000136, stamp folding).
- Independent oracle: Python tries every permutation of layers and models folds as small arcs with float geometry. 387 cases (all unit strips to 7 segments, 260 random strips with lengths 1 to 3) match with 0 mismatches; 67 are unfoldable, 198 have several foldings.
- Every listed stacking passes a separate full checker; 6 of 6 mutations are caught.

## Known limits
- One-dimensional strips, all folds flat (180 degrees), zero paper thickness, integer lengths 1 to 99, at most 40 creases.
- The oracle and the engine share my idea of what counts as a fold cutting through paper; only the unit-length case has an outside number.
- Counts above about 10^5 are lower bounds. Only Chromium was driven. Nobody else has used it.
