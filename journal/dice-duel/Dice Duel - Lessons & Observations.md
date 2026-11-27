---
title: Dice Duel - Lessons & Observations
type: ai-project
project: Dice Duel
note: lessons
date: 2026-11-27
tags: [ai-project, lessons]
---

# Dice Duel: Lessons & Observations

## Surprises and emergent behaviour

- Advantage with a +5 bonus loses to a flat +10 bonus on a d20 (39.8% against 55.5%, ties 4.7%), but its distribution is far narrower in the tail: it reaches 25 almost 10% of the time, which the flat bonus never does. The chart shows that more clearly than the number.
- The common intuition "advantage is about +5" is close to its mean gain (13.825 against 10.5), but the shape differs.

## Engineering lessons

- Brute-force enumeration is a strong, cheap oracle for exact counting problems.
- Do exact arithmetic in integers and divide once; per-term truncation accumulates.
- When a test fails, suspect the oracle first: mine was wrong about precedence, not the engine.
- A mutation that "survives" can be a bug in the mutation script (the `=>` delimiter) or a real missing test (the spread). Tell them apart before reporting.

## Process lessons

- Checking the engine by hand against two published numbers before writing any tests caught nothing, but it gave me confidence the later failures were test errors.
- Reading the screenshot caught a wording problem ("1 in 1.0") that no test would.

## Open questions

- Would a player type a second expression, or would they only use presets?
- Is exactness (rather than a fast simulation) something people care about, or just something I care about?
- What is the first matchup a real player would try, and does the engine support it?

Related: [[Dice Duel]] · [[Dice Duel - Build Log]] · [[Dice Duel - Value & Future]]
