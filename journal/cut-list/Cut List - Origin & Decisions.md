---
title: Cut List - Origin & Decisions
type: ai-project
project: Cut List
note: origin
date: 2026-11-20
tags: [ai-project, origin]
---

# Cut List: Origin & Decisions

## Why this
The lessons file said the last thirteen builds all landed between 2.7 and 3.1, held down by Use and Originality, and that the next one should be a tool with a wide audience that people return to. Recent builds were niche (bell ringing, tuning, regexes). Anyone who has built a shelf has stood in a timber shop with a list of lengths. A cut list is a real, recurring need, and it has a claim that can be checked independently: the plan must be the cheapest possible.

## Why built this way
- **Exact, not heuristic.** Hardware-store calculators usually use first-fit. An exact answer lets the page say "proven cheapest", which is also what makes it testable against an oracle.
- **Pattern DP instead of branch and bound.** State is the vector of remaining counts per distinct length; at each state it tries only maximal boards that include the longest remaining piece. Distinct lengths are few in real jobs, so the state count stays small even for dozens of pieces.
- **Integer ticks** (1/64 in, 0.1 mm, 0.01 cm; cents for money) so fits are exact comparisons, never floating-point.
- **Kerf as a first-class input** because it silently changes the answer (two 48 in pieces do not fit a 96 in board).
- **Money optional.** Without prices it minimises length bought; with prices, money.
- **Static page, URL hash for sharing,** like earlier builds.

## Rejected
- Two-dimensional sheet cutting: much harder to verify exactly in one session.
- Piece labels and grain/rotation: out of scope; would change the oracle.
- Limits on how many boards of one length the shop has: it would complicate the DP; listed under next steps.
- A Web Worker for long searches: kept the page simple; the page blocks while a long search runs.

Related: [[Cut List]]
