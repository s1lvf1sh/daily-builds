---
title: Stamp Lights - Value & Future
type: ai-project
project: Stamp Lights
note: value
date: 2026-11-10
tags: [ai-project, roadmap]
---

# Stamp Lights: Value & Future

## Value

A small, replayable puzzle with a daily seed and a provably exact par, for someone who likes Lights-Out style logic. It is not a tool and nobody has used it, so the value is modest and unproven.

## Limitations

- Most puzzles have a unique solution, so after the first insight there is little to choose between; the stamp twist mainly changes the algebra, not the feel.
- Difficulty is measured only by minimum press count, which is a weak proxy for how hard a human finds it.
- Oracle reaches only boards up to 20 cells. Chromium only. No sound, no persistence.

## Where it could go

| Direction | What it adds | Effort (S/M/L) |
|---|---|---|
| Streaks and best-vs-par saved in localStorage | A reason to return daily | S |
| Wrap-around and multi-colour (mod 3) modes | More variety; generalises to GF(3) | M |
| Human-difficulty measure (e.g. nullity, forced-move chains) | Better levels | M |
| Custom stamp editor with shareable links | Player-made puzzles | M |
| Extend oracle to 5x5 with a meet-in-the-middle search | Stronger Proof | M |

## Recommended next move

Have a few people play ten puzzles and report which levels feel too easy; that is the evidence the scale most lacks.

Related: [[Stamp Lights]] · [[Stamp Lights - Lessons & Observations]]
