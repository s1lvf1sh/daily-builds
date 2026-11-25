---
title: Ripple Tank - Build Log
type: ai-project
project: Ripple Tank
note: build-log
date: 2026-11-25
tags: [ai-project, build-log]
---

# Ripple Tank: Build Log

## Process
```mermaid
flowchart LR
  A[Plan] --> B[Engine] --> C[Tests + oracles] --> D[Page] --> E[Browser check] --> F[Mutants] --> G[Document]
```

## Steps
1. Wrote `src/wave.mjs` (leapfrog solver, sponge, walls, sources, presets, energy).
2. Wrote 9 Node tests against physics oracles. First run: 4 of 9 failed.
3. Wrote the page and a Playwright script (`test/browser.mjs`).
4. Looked at screenshots of the double-slit, lens and phone views; fixed the lens and shelf frequencies.
5. Ran 9 mutants with a copy-and-sed script.

## What went wrong, and how it was fixed
- **Pulse test (travelled 64, wanted 150):** a plane pulse in a 41-cell strip is spoiled by the zero edges. Replaced by a ring in a large tank.
- **Energy drift 8%:** the shallow patch in the test. With variable speed the scheme is not energy conserving, so the test now uses uniform depth and I list this as a limitation.
- **Echo position off by 7 cells:** a fixed wall inverts the wave, and I searched for the crest. Searching for the trough fixed it.
- **Shallow wavelength ratio 0.574 against 0.6:** numerical dispersion at 7.5 cells per wavelength. Lowered the frequency to 0.02 (14 to 25 cells).
- **No wave at all in the channel test:** the sponge ran along the narrow strip and swallowed it. Then the strip was a waveguide (29.7 against 25 cells). Made it 200 cells wide with the sponge only at the ends.
- **Only 3 fringes found:** the window was too small; slit separation 60 and a wider window gave 5 or more.
- **Browser "bright crest" check:** threshold too high for a decayed ring; lowered it and raised the display gain.
- **Lens preset:** checkerboard patterns inside the shallow lens at frequency 0.05; changed to 0.035. A later screenshot shows less checkering, but the edge of the lens is still jagged (the lens is a hard-edged speed step on a coarse grid).

## Numbers
9 engine tests in about 7 s. Mutants: 8 of 9 caught, survivor `slit width`. Browser run about 40 s.

## What was not checked
- Any person using it; touch input; Firefox and Safari.
- The lens preset is still slightly jagged at its edge; I did not smooth the speed step.
- Frame rate on a slow phone (about 38,400 cells and up to 6 steps per frame).
- Focus position of the lens and the refraction angle on the shelf against a formula.
- Diffraction envelope of a single slit.
