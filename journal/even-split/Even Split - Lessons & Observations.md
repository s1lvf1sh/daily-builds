---
title: Even Split - Lessons & Observations
type: ai-project
project: Even Split
note: lessons
date: 2026-11-09
tags: [ai-project, lessons]
---

# Even Split: Lessons & Observations

## Surprises and emergent behaviour

- Plain greedy matching nearly always matches the optimum on random groups; independent clusters are what separate it. In the first sweep the exact search saved only 3 payments against n-1; once clustered cases were added it saved 69.
- A mutation made the oracle hang rather than fail.

## Engineering lessons

- A sweep that never contains the hard case proves nothing: shape the generator to hit it.
- An oracle must refuse impossible inputs quickly, or a bug becomes a timeout.
- `innerText` reflects CSS text-transform.

## Process lessons

- Mutating on purpose found a weak sweep within minutes.

## Open questions

- Do people prefer the minimum payment count or payments that follow who actually owes whom?
- Is the line syntax learnable without the hint text?

Related: [[Even Split]] · [[Even Split - Build Log]] · [[Even Split - Value & Future]]
