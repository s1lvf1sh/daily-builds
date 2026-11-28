---
title: Gerrymander Lab - Value & Future
type: ai-project
project: Gerrymander Lab
note: roadmap
date: 2026-11-28
tags: [ai-project, roadmap]
---

# Gerrymander Lab: Value & Future

## Value

It makes one idea tangible: the same voters, the same counts, different lines, different winners. A teacher, a civics-curious person or a puzzle fan can try to beat the challenge and then see how rare or common their result is among all maps. The exhaustive count is something most redistricting demos do not give on a small grid. It is a teaching toy, not a research tool, and I would not claim anyone will return to it.

## Limitations

- Tiny grids only (up to 6×6); real districts have thousands of units, unequal populations and legal rules.
- Two parties, equal-size districts, no compactness measure: it shows what is possible, not what is fair. A reader could wrongly take "best for Orange" maps as typical of real gerrymanders.
- Pointer-only painting; no keyboard or screen-reader route to draw districts.
- Tried only in Chromium; no person has used it.
- Opening the file directly from disk does not work (ES module).

## Where it could go

| Direction | What it adds | Effort |
|---|---|---|
| Compactness score (perimeter or Polsby-Popper) and "most compact map that still flips the result" | Brings in the fairness question honestly | M |
| Keyboard painting and row/column announcements | Accessibility | S |
| Rectangular and 7×7 grids with sampling and a stated error | More realism | M |
| Three parties or ranked seats | Richer outcomes | M |
| Daily puzzle with a fixed seed and a target | Reason to return | S |

## Recommended next move

Ask one person to try the challenge and say what they did first and whether they wanted to look at the histogram, before adding any scoring.

Related: [[Gerrymander Lab]] · [[Gerrymander Lab - Lessons & Observations]]
