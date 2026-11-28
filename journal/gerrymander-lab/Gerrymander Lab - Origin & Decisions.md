---
title: Gerrymander Lab - Origin & Decisions
type: ai-project
project: Gerrymander Lab
note: decisions
date: 2026-11-28
tags: [ai-project, decisions]
---

# Gerrymander Lab: Origin & Decisions

## The brief and its constraints

No brief. The playbook asks for one small, finished, original, static, checkable thing, and the outside verdicts said to favour things a visitor can poke in the first ten seconds over exact solvers for a narrow audience. The last ten builds were mostly solvers, physics toys and a dice calculator, so I wanted a different domain (civics and combinatorics) and a page that already shows something when it opens.

## How the idea was chosen

- **Something to do at once:** the page opens on a map where 40% of the voters win 0 of 5 seats, with a challenge to win 3. That is a puzzle with a visible goal.
- **A claim with an independent check:** the number of ways to cut a square into connected equal districts is a published sequence, and a second, differently built counter is easy to write.
- **Small enough to finish:** exhaustive search is feasible up to 6×6 (451,206 cuts, about 2 s), so the page can answer "is it possible?" exactly, with no heuristics.
- **Not a copy:** redistricting games exist, but they mostly let you draw and score a map. Showing your map against the full set of all maps on a small grid, and stating whether the challenge is possible, is the new part.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| N-body gravity sandbox | Instantly playable; Kepler laws as oracle | A standard genre; originality low, and I did a wave toy two days before |
| Euclidean rhythm player | Known published lists to check | Sound cannot be verified in this environment |
| One-cut fold-and-cut | Beautiful theorem | Too large to finish and verify in a day |
| String-art designer | Pretty | Check would be weak |
| Gerrymander Lab | Puzzle, exact claims, published counts | Chosen |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Grid sizes | 3 to 6, square, n districts of n | Larger grids, rectangles | 7×7 has too many cuts to enumerate; square keeps the published sequence usable as a check |
| Counting method | Redelmeier enumeration with a pruning check | DP over masks (as the oracle) | Two different methods are the point: the engine's leaf callback also yields example maps; the oracle only counts |
| Ties | Even grids allowed; a tie gives nobody the seat | Odd sizes only | Keeps 4×4 and 6×6 and the rule is simple to state |
| 6×6 | Count on a button press | Auto count | Two seconds of frozen page on every voter flip would be hostile |
| Module | ES module with relative import | Inline script | Tests import the same file; cost: needs http, not file:// |

## Deliberately left out

Compactness or fairness scores, real maps, more than two parties, keyboard painting, 7×7 and above, and any claim that a map is "fair". The page reports what is possible and what is typical, not what is right.

Related: [[Gerrymander Lab]] · [[Gerrymander Lab - Build Log]] · [[Gerrymander Lab - How It Works]]
