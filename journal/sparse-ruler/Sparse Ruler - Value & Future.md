---
title: Sparse Ruler - Value & Future
type: ai-project
project: Sparse Ruler
note: value
date: 2026-11-21
tags: [ai-project, roadmap]
---

# Sparse Ruler: Value & Future

## Value

Modest. The sparse ruler is a known puzzle, so the value is mostly a satisfying explorer: type a length, see the surprising small mark set, try to beat it. The "only these lengths" mode has a real, if rare, use: marking a stick or tape so a few specific gaps can be measured without a full scale.

## Limitations

- Whole numbers only, no fractions.
- Ends always count as marks.
- Exact proof only to about length 40; beyond that the answer is a heuristic with no optimality claim.
- Nobody has used it. A real woodworker may find the targets mode awkward.

## Next steps

- Move the search to a Web Worker (needs an HTTP origin, fine on Pages) so long searches do not freeze the page.
- Fractions (inches in sixteenths) by working in units of the smallest step.
- A printable strip at true scale.
- A better bound, such as branching on the smallest uncovered distance, to push the exact range higher.
