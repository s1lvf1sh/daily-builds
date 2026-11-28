---
title: Gerrymander Lab - Lessons & Observations
type: ai-project
project: Gerrymander Lab
note: lessons
date: 2026-11-28
tags: [ai-project, lessons]
---

# Gerrymander Lab: Lessons & Observations

## Surprises and emergent behaviour

- With 40% of the voters packed into the two left columns of a 5×5 grid, only 1 of 4,006 maps gives Orange nothing, 696 give 1 seat, 3,033 give 2 and 276 give 3. The "obvious" striped map is the single worst case; a majority of seats for the minority exists but is rare (276 maps, 6.9%).
- The number of cuts is small enough that "is it possible?" never needs a heuristic.

## Engineering lessons

- A published integer sequence is a free independent oracle for a counting engine; I had half remembered it, and the first run matching it was strong evidence.
- Two different algorithms (frontier growth in the engine, memoised bitmask DP in the oracle) agreeing on a full histogram checks more than a total does.
- Mutation testing found three real gaps even after the oracle comparison passed, because the oracle tests never touched `judge`'s size rule or the aggregation helper.
- Equivalent mutants exist when a rule is only an optimisation or a convention; say so rather than adding a contrived test.

## Process lessons

- Each mutant costs about 40 s when the suite includes 6×6 oracle runs; run the mutation loop in the background and write notes meanwhile.
- A narrow phone screenshot caught a wording bug (0.0%) that Node tests and a desktop view could not.

## Open questions

- Does a visitor stay after the first challenge, or leave once it is solved?
- Would a compactness score make the page more honest or just more complicated?

Related: [[Gerrymander Lab]] · [[Gerrymander Lab - Build Log]] · [[Gerrymander Lab - Value & Future]]
