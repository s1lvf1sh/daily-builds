---
title: Cut List - How It Works
type: ai-project
project: Cut List
note: how-it-works
date: 2026-11-20
tags: [ai-project, how-it-works]
---

# Cut List: How It Works

## Files
- `src/cut.js`: engine (no DOM). `parseInput`, `solve`, `firstFit`, `validatePlan`, `fmt`.
- `src/app.js`: reads the form, renders badges, shopping list and board strips, share link, text export.
- `index.html`: layout and styles (light and dark; works at 375 px).
- `test/`: `test.js`, `gen.js`, `oracle.py`, `oracle_cases.json`, `browser.js`.

## The rule
A board of length L can hold k pieces if `sum(lengths) + kerf*(k-1) <= L`. Everything is an integer: 1/64 in, 0.1 mm or 0.01 cm per tick; prices in cents.

## The search
Distinct piece lengths are the **types** (longest first). A state is the vector of how many of each type remain, packed into one integer (mixed radix). `f(state)` is the least `cost*1e6 + boards` to cut the remainder. To expand a state:

1. Take the first type still needed.
2. For each board length that can hold it, enumerate every **maximal** pattern that contains at least one of that type (cannot add any other remaining piece).
3. Try each: `board cost + f(state minus pattern)`. Keep the best; memoise.

Why maximal patterns are enough: removing more pieces from the remainder never makes the rest dearer, so any plan can be rewritten with each board filled as far as possible.

The cap is 1.5 million states or 4 seconds. Past it, the page shows the first-fit plan marked "not proven" and offers a 30 s search.

## Baseline
First-fit decreasing: place each piece, longest first, on the first open board it fits; otherwise open the board with the lowest cost per length. The page reports how much the exact plan saves over it.

## Safety net
`validatePlan` re-checks every plan the page draws (every piece cut exactly once, no board overfull). The page refuses to show a plan that fails it.

## Performance
36 pieces in 5 lengths over 3 board lengths: 17k states, 0.26 s. 72 pieces: 399k states, 13 s (the page would give up at 3 s). Typical 13-piece jobs: under 200 states.

Related: [[Cut List]]
