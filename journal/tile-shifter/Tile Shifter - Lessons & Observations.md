---
title: Tile Shifter - Lessons & Observations
type: ai-project
project: Tile Shifter
note: lessons
date: 2026-11-24
tags: [ai-project, lessons]
---

# Tile Shifter: Lessons & Observations

## Surprises and emergent behaviour
- Making a tile illegal is harder than expected: any amount of bump on one edge is legal, because its twin is a translated copy. Only dots that cross other sides or fold the curve back break it. At the default amplitude 352 of 400 random hexagon and parallelogram tiles (3 dots per edge) were legal at the first try, so Shuffle sometimes retries.
- The shuffled shapes look like leaves, fish and clouds, which is half the fun.

## Engineering lessons
- A second inside-test (winding number) beside the engine's crossing parity is a cheap independent oracle for geometry.
- My first self-crossing test was wrong; I had assumed a big bump would cross. Derive the claim, run it, then assert it.
- A mutant that never applied (pattern missing) looked like a survivor; check the mutation applied.
- An "equivalent" mutant is a signal that a check is redundant, not that a test is missing.

## Process lessons
- Starting with the engine and oracle before the page left only visual work for the end.
- A pixel test (transparent pixels in the real canvas) is a good end-to-end check for "no gaps", but blind to small overlaps, so keep the geometric test.

## Open questions
- Does dragging dots feel good to a stranger in the first ten seconds?
- Would they come back for rotation tiles, or for drawing on the tile?

Related: [[Tile Shifter]] · [[Tile Shifter - Build Log]] · [[Tile Shifter - Value & Future]]
