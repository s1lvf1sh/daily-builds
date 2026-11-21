---
title: Sparse Ruler - How It Works
type: ai-project
project: Sparse Ruler
note: how-it-works
date: 2026-11-21
tags: [ai-project, architecture]
---

# Sparse Ruler: How It Works

## Overview

A ruler of length L is a set of marks in 0..L that includes both ends. It measures every pairwise difference.

## Files

- `src/ruler.js`: the engine (works in Node and the browser).
- `index.html`: reads inputs, calls the engine, draws an SVG stick and a grid map.
- `test/test.js`, `test/oracle.py`, `test/oracle_cases.json`, `test/browser.js`.

## Mechanisms

- **Exact search.** For k from the smallest count allowed by k(k-1)/2 >= (number of targets) upward, choose the k-2 interior marks in increasing order, keeping a count per distance. Prune when the targets still uncovered exceed the most new distances the remaining marks could add: with m marks placed and r to go, at most r*m + r(r-1)/2. The first k that works is the proven minimum, because every smaller k was exhausted.
- **Counting optima.** With `countAll` it counts every k-mark solution and the palindromic ones, and reports (all + palindromes)/2 as the number up to mirror image. The oracle counts the same way, which makes the comparison strict.
- **Fallback.** After the 4 s budget, simulated annealing moves one mark at a time on a fixed count k, trying k upward from the floor. It returns only a ruler with zero missing targets.
- **Wichmann family.** W(r,s) has steps 1 x r, r+1, 2r+1 x r, 4r+3 x s, 2r+2 x (r+1), 1 x r. It is used as a test (complete, right size) and to check the exact search never needs more marks than it.

## Performance

Complete rulers: length 30, 67 ms; 34, 34 ms; 38, 0.9 s; 42, 0.5 s; 45, 14 s. Larger complete lengths use the annealer (length 80 found 17 marks in about 2 s). The oracle runs 282 cases in about 1 s.
