---
title: Knotwork - Lessons & Observations
type: ai-project
project: Knotwork
note: lessons
date: 2026-11-15
tags: [ai-project, lessons]
---

# Knotwork: Lessons & Observations

## Surprises and emergent behaviour
- The gcd law held on the first run for all 144 sizes; the segment model was right from the start.
- The weave rule needed no knowledge of strand order: a local parity rule alternates along every strand in 1,500 random layouts.
- Random walls at density 0.3 mostly produce many small loops (the 12 x 8 example had 14 strands, several of 4 or 8 segments).

## Engineering lessons
- A closed-form fact (gcd) is the cheapest independent oracle there is. Look for one first.
- When the engine links cell pieces, model the oracle as a moving point; the two share no structure.
- Mutating a symmetry helper showed my test only counted orbit size; check the actual geometry.
- Hand-computed expectations were wrong again (6 x 4 strand lengths); derive from totals.

## Process lessons
- Read a multi-strand screenshot as well as a single-strand one; the single-colour case hides colour problems.
- Re-query Playwright elements after any re-render.

## Open questions
- Does a single-strand layout exist for every size and symmetry? The search only finds, never refutes.
- Is the mirror-image weave ever preferable, and does anyone care?

Related: [[Knotwork]] · [[Knotwork - Build Log]] · [[Knotwork - Value & Future]]
