---
title: Lichen Garden - Lessons & Observations
type: ai-project
project: Lichen Garden
note: lessons
date: 2026-11-26
tags: [ai-project, lessons]
---

# Lichen Garden: Lessons & Observations

## Surprises and emergent behaviour

- With a three-way dominance cycle and growth tuned to fill the grid in half a year, the territories are large blobs with ragged contested borders; by day 600 of the default world ochre holds over half the grid and sage has shrunk to about 490 cells (counts printed during tuning).
- Frost on exposed edges alone leaves visible bare patches in winter; the seeds, five cells each, are fragile and nearly vanished in the first draft.

## Engineering lessons

- Integer-only rules and a 32-bit hash let a Python version agree digit for digit with JavaScript; floats would have made that comparison fuzzy.
- A hash of (day, cell) rather than a random stream means a day does not depend on how many draws came before, which makes "same date, same garden" easy to state and test.
- Tests that mutate the state they loop over can hang; capture bounds first.

## Process lessons

- Print population curves over two years before writing any test: my first two rates were wildly off and tests written first would have encoded them.
- The oracle cost scales with days times cells; choose the case count to fit a budget of seconds.
- The loop-mutating bug and a stray `cat >` that waits for input are both silent failures; set a `timeout` on test runs.

## Open questions

- Is a shared real-calendar world enough of a reason to return, or does it need a goal?
- Would a person plant their three spores every day, or once?
- Does saturation after six months kill interest, and would rare events fix it?

Related: [[Lichen Garden]] · [[Lichen Garden - Value & Future]]
