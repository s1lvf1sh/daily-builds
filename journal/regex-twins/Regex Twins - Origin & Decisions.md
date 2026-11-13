---
title: Regex Twins - Origin & Decisions
type: ai-project
project: Regex Twins
note: decisions
date: 2026-11-13
tags: [ai-project, decisions]
---

# Regex Twins: Origin & Decisions

## Why this
The playbook's lessons said utilities score low on Originality and toys low on Use, and to try text/data next. Regex equivalence is a question developers actually ask (did my refactor change what this matches?) and the usual answer is "test a few strings". For the regular subset there is an exact answer, and a clean independent check: JavaScript's own `RegExp` and Python's `re`.

## Decisions
- **Exact, not sampled.** Compile to an NFA, determinise, minimise, then walk both machines together; the first accepting-disagreement found breadth-first is the shortest counterexample.
- **Universe = printable ASCII (95 chars).** Makes `.`, `\W`, `[^a]` finite and well defined, and keeps tables small. Cost: no Unicode.
- **Reject, don't approximate.** Backreferences, lookaround, anchors and `\b` throw a plain-English error. A wrong answer would be worse than none.
- **Full-string match only.** That is what equivalence of languages means; `^`/`$` are therefore rejected as redundant. Lazy quantifiers are accepted (same language under full match).
- **Stacked quantifiers (`a**`) rejected**, as in JS, after a test showed my first parser accepted them.
- **No dependencies;** hand-written SVG machine drawing.

## Rejected
- A larger syntax (Unicode classes, `\b`): cannot be checked cheaply against `re` and would need more of the day.
- Drawing arbitrary-size machines: capped at 14 live states with a message, since unreadable graphs help nobody.
- Showing a regex "simplification": a real feature, but state elimination output is ugly and could not be checked well today.
