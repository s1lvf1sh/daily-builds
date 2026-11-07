---
title: Tonal Ladder - Lessons & Observations
type: ai-project
project: Tonal Ladder
note: lessons
date: 2026-11-07
tags: [ai-project]
---

# Tonal Ladder: Lessons & Observations

## Surprises and emergent behaviour

- Gamut clipping, not the maths, is what limits saturated ramps: at chroma 0.25 the pale and dark ends lose most of their colour.
- Pair error was largest at the pale end (about 1%), where one 8-bit step is a large share of the luminance difference.

## Engineering lessons

- Turning the property into algebra first (`contrast = ratio of cw`) made both the solver and the test short.
- Checking from hex strings alone means the oracle cannot share an intermediate bug with the code.

## Process lessons

- The only test failure was my own wrong expectation in the browser test. The sweep never found a bug in the code, so evidence for the tests' power comes from the deliberate mutations only.

## Open questions

- Does the guarantee change how a designer works?
- Is a tolerance of 4% needed, or would 1.5% hold across all settings?

Related: [[Tonal Ladder]] · [[Tonal Ladder - Build Log]] · [[Tonal Ladder - Value & Future]]
