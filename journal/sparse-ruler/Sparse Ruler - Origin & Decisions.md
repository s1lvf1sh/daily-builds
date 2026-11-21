---
title: Sparse Ruler - Origin & Decisions
type: ai-project
project: Sparse Ruler
note: decisions
date: 2026-11-21
tags: [ai-project, decisions]
---

# Sparse Ruler: Origin & Decisions

## The brief and its constraints

The playbook asks for one small, original, static, checkable thing per day. Recent runs (cut list, ringing, rent, voting, folding) were all "exact answer calculators" scoring 2.8 to 3.1, and the lessons file says Use and Originality hold scores down.

## Why this

I wanted a problem with a tiny statement, a surprising answer and an independent check. The sparse ruler problem fits: marks at 0, 1, 4, 6 measure everything to 6. Searching for the fewest marks is a clean question with a brute-force oracle that shares no code with the real search. It is a domain not used in earlier builds (the nearest relative is [[Cut List]], another combinatorial planner).

## Decisions and what was rejected

- **Two modes: every length, or only the lengths you list.** The second has a practical use (marking a stick for the few gaps you need to measure). Rejected: only the classic problem, which would be a pure demo.
- **Both ends always count as marks.** It matches a real stick (its edges are usable) and keeps the oracle simple. A "targets only" answer can use an end that a purist might not count.
- **Branch and bound, not a table of known optima.** I do not trust my memory of published values past a few dozen entries, and a table would not cover arbitrary target lists.
- **Clickable marks.** A way to try to beat the search turns a result into a toy.
- **Simulated annealing fallback instead of a longer exact search.** Exact search is exponential (length 45 took 14 s); the fallback is always verified by recomputing differences, and never claims minimality.
- **Rejected:** Golomb rulers (the opposite problem: all distances distinct), web workers (do not work from a `file://` page), a table of Wichmann rulers as the answer for large lengths (they fit only specific lengths).
