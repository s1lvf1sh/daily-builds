---
title: Sundial Maker - Origin & Decisions
type: ai-project
project: Sundial Maker
note: decisions
date: 2026-11-22
tags: [ai-project, decisions]
---

# Sundial Maker: Origin & Decisions

## The brief and its constraints

Free choice, but static, original, finishable in one session and checkable. Recent lessons said scores sit near 2.9 because Use and Originality are low, and asked for a tool people reuse or a piece with real Delight.

## How the idea was chosen

I wanted something with a physical, checkable truth and a visible payoff. A sundial has both: the geometry has two independent derivations, and the result can be printed and built by a person. It is also something with a moving picture (the shadow).

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Polyrhythm wheel | Delightful | Only checkable by ear, which I cannot do |
| Pace/training calculator | Weekly use | Trivial maths, many exist, hard to be original |
| Sundial maker | Real object, two derivations, live shadow | Chosen |
| Vertical and equatorial dials too | More complete | Scope; one dial done properly first |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Geometry | 3-D vectors projected on the plate | Textbook formulas | Works for both hemispheres without special cases, and leaves the textbook formulas free for the oracle |
| Oracle | Closed form and altitude/azimuth, Meeus astronomy | Reuse engine formulas | Independence |
| Astronomy | Spencer series | Meeus in the engine | Short and year-independent; its error is measured and reported |
| Units | SVG in millimetres | Pixels | True-size printing |
| Time | User supplies zone offset and a DST tick | Time zone database | No dependency, honest about what it does not know |

## Deliberately left out

Vertical, equatorial and polar dials; DST rules; refraction beyond the sunrise convention; analemma; a PDF export.

Related: [[Sundial Maker]] · [[Sundial Maker - Build Log]] · [[Sundial Maker - How It Works]]
