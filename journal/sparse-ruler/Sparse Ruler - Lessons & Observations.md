---
title: Sparse Ruler - Lessons & Observations
type: ai-project
project: Sparse Ruler
note: lessons
date: 2026-11-21
tags: [ai-project, lessons]
---

# Sparse Ruler: Lessons & Observations

## Surprises and emergent behaviour

- Optimal rulers are often numerous: the oracle lists 250 different optimal 8-mark rulers (up to mirror) for length 18 and 65 for length 14, and only 1 for length 6.
- The minimum equals the floor k(k-1)/2 >= L only at lengths 1, 3 and 6 among 1 to 22 (the classic perfect rulers); I recall that no larger one exists, but did not check.
- A random target list needed one more mark than I guessed (5, not 3 or 4).

## What carries over

- Counting solutions up to symmetry is a stronger oracle comparison than comparing just the optimum.
- Brute force over `itertools.combinations` is enough for a small domain and runs in one second.
- Test constructions for completeness before using them; my first Wichmann builder failed that check immediately.
- Label heuristic answers loudly in the UI, and keep a path to run longer.

## Open questions

- Would anyone use the targets mode on a real stick?
- How far does a better bound push the exact search?
