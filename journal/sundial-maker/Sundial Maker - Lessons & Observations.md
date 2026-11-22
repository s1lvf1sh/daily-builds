---
title: Sundial Maker - Lessons & Observations
type: ai-project
project: Sundial Maker
note: lessons
date: 2026-11-22
tags: [ai-project, lessons]
---

# Sundial Maker: Lessons & Observations

## Surprises and emergent behaviour

- The hour line direction really does not depend on the date: the test passed on the first try, which pleased me.
- The classic Spencer fit is 0.44 degrees off in 2026 near the equinoxes; the dial effect is small but the tight day-length check had to be split in two to show that.

## Engineering lessons

- Vector projection handles both hemispheres with one sign flip in the style direction.
- A mutant that survives means the tolerance is too loose, not that the code is right.
- Cloning an SVG for printing doubles selectors.

## Process lessons

- Feed the oracle's inputs to the engine to separate algorithm error from approximation error.
- Take a phone screenshot and read scrollWidth.

## Open questions

Does a printed plate keep its scale in practice? Would a vertical dial be the more wanted tool? Does the live shadow help someone understand the dial?

Related: [[Sundial Maker]] · [[Sundial Maker - Build Log]] · [[Sundial Maker - Value & Future]]
