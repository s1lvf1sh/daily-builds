---
title: Sparse Ruler - Build Log
type: ai-project
project: Sparse Ruler
note: build-log
date: 2026-11-21
tags: [ai-project, build-log]
---

# Sparse Ruler: Build Log

## Process

1. Wrote `src/ruler.js`: distances, missing, a depth-first search by increasing number of marks with a counting bound, a Wichmann builder and an annealer.
2. Timed it: complete rulers of length 30 in 60 ms, 40 in 0.7 s, 50 in 8 s; 58 did not finish in 60 s.
3. My first Wichmann builder had leftover scratch code and the wrong step order: its rulers were missing distances (W(1,0) missed 4). I replaced it with the published step pattern; all 35 parameter pairs (r 0 to 4, s 0 to 6) now give complete rulers with the stated length and mark count.
4. Wrote `test/oracle.py` (every combination of marks, smallest size first) and `test/test.js`. First run: 1228 pass, 1 fail. The failure was my hand-written expectation: ruler 0,1,3,6 measures 1,2,3,5,6 and misses only 4, not 4 and 5.
5. Mutation check: 10 broken engines, all caught (the weakest, `clean` and `missing`, by 1 check each; `lb` by 3).
6. Wrote the page, then `test/browser.js`. First run failed one check: I had guessed 3 or 4 marks for targets 3, 5, 12, 19 on length 24; the engine said 5. A separate Python brute force found no set of 4, so the engine was right.
7. Read the desktop and phone screenshots. On a phone the stick scrolls inside its card rather than the page.

## What went wrong

- A wrong Wichmann builder, caught at once by a completeness test.
- Two wrong hand-written expectations.

## What was not checked

- Minimality beyond length 22 (complete) or length 20 (target subsets) has no independent oracle. For larger lengths only "the returned ruler measures every target" is tested.
- The OEIS match is from memory of the sequence; I did not fetch it.
- Only Chromium. No touch device, no screen reader. Keyboard activation of positions (Enter/Space) was added but no test presses those keys.
- The length-80 heuristic result (17 marks) was not compared with the best known value.
- The 30 s extra search was not clicked in a test; it blocks the page while it runs.
- The dark-mode screenshot was taken but I did not read it.
