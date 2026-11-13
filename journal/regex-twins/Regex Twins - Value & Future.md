---
title: Regex Twins - Value & Future
type: ai-project
project: Regex Twins
note: value
date: 2026-11-13
tags: [ai-project, value]
---

# Regex Twins: Value & Future

## Honest value
Useful when you refactor a pattern and want proof it still matches the same strings, or want to know why two look-alike patterns differ (it gives the string). The counts and examples are a pleasant way to understand a pattern. Nobody else has used it, so that is a belief and not a measurement.

## Limits
- Regular subset only; many real-world patterns use anchors, lookahead or Unicode and are rejected. This limits Use.
- Printable ASCII only.
- Equivalence of backtracking-engine behaviour (captures, performance) is not in scope: it compares languages, not engines.
- Exponential machines hit a 5000-state guard.

## Next steps
1. Optional anchors and `\b` by modelling them as the language over a padded string.
2. Unicode classes with an alphabet partition instead of 95 columns.
3. Show the product-machine path to the counterexample step by step.
4. Regex to simplified regex by state elimination (hard to verify).
5. Have a developer try three of their own refactors and report what was missing.
