---
title: Strip Folds - How It Works
type: ai-project
project: Strip Folds
note: how-it-works
date: 2026-11-17
tags: [ai-project, architecture]
---

# Strip Folds: How It Works

## Overview
`src/fold.js` is a pure engine that runs in Node and in the browser. `index.html` is a thin page on top. `test/oracle.py` is the independent brute force.

## Model
A strip has n+1 segments and n creases. Folded flat, every segment lies on one line; segment i runs from x[i] to x[i+1], with the direction alternating (x[0] = 0). A stacking is a layer number for each segment (0 is bottom).

- **Mountain/valley rule:** looking at segment k from above, crease k is V when segment k is face up and the next segment goes above it, or when segment k is face down and the next goes below. Faces alternate, so this reduces to a parity rule on k.
- **No-cut rule:** crease k sits at x[k+1] and bulges to the side away from its two segments. It is blocked if another segment lies in that loop on a layer between the two creased layers. Two creases at the same position interleave (a<c<b<d) are blocked. A segment that ends exactly at the fold on the paper side is fine; one that starts there and extends to the bulge side is not (this is the case the oracle caught).

## Search
Segments are inserted in order into an ordered list. The previous segment fixes whether the new one goes above or below, leaving a contiguous range of insertion points. After each insertion only pairs involving the new segment and the new crease are re-checked. The search counts all leaves, keeps the first 200, and stops at 3 million nodes (then the count is reported as a lower bound).

`verify()` rechecks a finished stacking against every pair, using no search state; tests run it on every stacking the search listed.

## Page
Reads creases and lengths, calls `solve`, shows the verdict, draws the stacked side view (bars at layer heights, arcs for creases) and the 90-degree curve. State lives in the URL hash (`#VVMVV/1,2,1,1,1,1`).

## Performance
Unit strips with 12 creases return in milliseconds. The dragon curve with 5 folds (31 creases) has more than 179,000 foldings; the search hits its node cap in about 2 seconds and reports a lower bound. The first folding is found immediately.

## Files
`src/fold.js`, `index.html`, `test/test.js`, `test/oracle.py`, `test/oracle_cases.json`, `test/browser.js`, `README.md`.
