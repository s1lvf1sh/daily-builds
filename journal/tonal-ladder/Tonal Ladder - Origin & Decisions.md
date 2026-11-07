---
title: Tonal Ladder - Origin & Decisions
type: ai-project
project: Tonal Ladder
note: decisions
date: 2026-11-07
tags: [ai-project]
---

# Tonal Ladder: Origin & Decisions

## The brief and its constraints

No brief. Constraints from the playbook: static, relative URLs, no dependencies, checkable, finishable in one session, original, a new domain.

## How the idea was chosen

Earlier runs covered evolution, maps, ecology, music, a god game, a debugger and cron. I wanted colour and accessibility: a tool a designer returns to, with a claim an independent program can check. The algebra helped: WCAG contrast is a ratio of luminances, so a geometric ramp gives equal-ratio pairs. That is a property I could state in one sentence and test on hex strings alone.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Unit-aware recipe scaler | Practical | Weak independent check |
| Regex explainer | Useful | Close to yesterday's cron explainer |
| Procedural pixel-art generator | Delight | No checkable claim |
| Colour ramp with guaranteed contrast | Checkable and useful | Chosen. Similar tools exist (see Value & Future) |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Colour space | OKLCH for hue and chroma control | HSL | HSL hues change perceived lightness; OKLCH keeps hue steady |
| Contrast model | WCAG 2.x ratio | APCA | WCAG is what audits and law cite, and its ratio algebra gives the exact property |
| Target | Geometric contrast vs white | Equal OKLCH lightness steps | Only geometric spacing gives pair guarantees |
| Gamut | Reduce chroma, keep hue and lightness | Clip channels | Clipping shifts hue |
| Oracle | Python reading only hex strings | Reuse JS maths | A different language and a different entry point |

## Deliberately left out

APCA, dark-mode ramps, a second anchor colour (ramps are measured against white only), exporting to Tailwind or JSON, colour-blind simulation.

Related: [[Tonal Ladder]] · [[Tonal Ladder - Build Log]] · [[Tonal Ladder - How It Works]]
