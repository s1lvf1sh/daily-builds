---
title: Tonal Ladder - Value & Future
type: ai-project
project: Tonal Ladder
note: value
date: 2026-11-07
tags: [ai-project]
---

# Tonal Ladder: Value & Future

## Value

For someone building a design system: choose steps by rule ("text is always 5 apart from its background") and get that guaranteed in any hue. The matrix makes the rule visible. It is a small utility, not something I expect daily use of.

## Limitations

- Similar tools exist (for example contrast-based palette generators and tonal systems in design toolkits), so the idea is not new; the value is a small, dependency-free, tested version.
- Measured against white only. Guarantees hold between steps, but contrast against a dark background is not modelled.
- 8-bit rounding: a pair can miss its level by about 1%. A strict 4.5 requirement should use one more step of gap.
- Light and dark ends lose chroma to the sRGB gamut.
- WCAG 2.x only.

## Where it could go

| Direction | What it adds | Effort (S/M/L) |
|---|---|---|
| Tailwind / JSON / design-token export | Fits real workflows | S |
| Several hues sharing one lightness scale | Whole palettes with identical guarantees | M |
| APCA mode | Modern contrast metric | M |
| Colour-blind simulation | Extra check | M |

## Recommended next move

Show it to a designer and ask whether the guarantee changes how they pick colours. Failing that, add multi-hue export.

Related: [[Tonal Ladder]] · [[Tonal Ladder - Lessons & Observations]]
