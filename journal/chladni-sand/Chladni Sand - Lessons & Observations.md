---
title: Chladni Sand - Lessons & Observations
type: ai-project
project: Chladni Sand
note: lessons
date: 2026-11-08
tags: [ai-project, lessons]
---

# Chladni Sand: Lessons & Observations

## Surprises and emergent behaviour

Sand settles far faster than expected: mean |u| dropped from about 0.4 to under 0.03 within 600 steps in every tested mode. A pure product mode (s = 0) is just a rectangular grid, so the interesting figures all come from mixing.

## Engineering lessons

- When the oracle is discrete and the code is continuous, compare against the exact discrete eigenvalue for the same index, not "nearest to the continuum value"; the latter fails at high modes on a coarse grid.
- No numpy is available. Sturm bisection gives eigenvalues in a few lines of pure Python.

## Process lessons

- Both failing tests on the first run were test-design errors, not code bugs. Check the oracle before suspecting the code.
- A browser check that starts after the system has already converged proves little. Capture the first value before the first animation frame next time.

## Open questions

Would the free-edge plate be worth the work? Would a person find the figures as pleasing in motion as in a still image?

Related: [[Chladni Sand]] · [[Chladni Sand - Build Log]] · [[Chladni Sand - Value & Future]]
