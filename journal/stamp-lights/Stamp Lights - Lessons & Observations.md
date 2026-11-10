---
title: Stamp Lights - Lessons & Observations
type: ai-project
project: Stamp Lights
note: lessons
date: 2026-11-10
tags: [ai-project, lessons]
---

# Stamp Lights: Lessons & Observations

## Surprises and emergent behaviour

- Almost every generated puzzle had nullity 0, i.e. exactly one solution, which makes a "minimum" claim easy to satisfy and weakly tested. Only certain stamps (like the classic plus on 4x4) give many solutions.
- Clipping at the edge makes the corner presses small, so a stamp that looks symmetric still behaves asymmetrically.

## Engineering lessons

- BigInt bit rows make GF(2) elimination short enough to read in one screen.
- A brute-force BFS over 2^20 states in Python takes a few seconds, which is cheap for an oracle.
- A sweep should be checked for containing the interesting cases (here: unsolvable boards, 128 of 2480).

## Process lessons

- Write the oracle before the UI; the UI took one pass because the core was already trusted.
- My first "unsolvable" unit test encoded a wrong belief. The oracle, not my intuition, was the reliable judge.

## Open questions

- Is exact par satisfying, or would players prefer a looser target?
- Do the three levels differ in human difficulty as much as in par (5.1, 6.7, 8.9)?

Related: [[Stamp Lights]] · [[Stamp Lights - Build Log]] · [[Stamp Lights - Value & Future]]
