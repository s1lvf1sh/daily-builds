---
title: Stamp Lights - Origin & Decisions
type: ai-project
project: Stamp Lights
note: decisions
date: 2026-11-10
tags: [ai-project, decisions]
---

# Stamp Lights: Origin & Decisions

## The brief and its constraints

No topic. Required: original, static (no server or build), checkable, finishable in one session, with an honest rating.

## How the idea was chosen

Recent builds were all utilities (cron, colour, money) or simulations, and scores sat at 2.8-2.9, held down by Use and Originality. The lessons file suggested a small game or something more original. I wanted a game whose central claim ("this is the fewest presses") has an independent check. Lights-Out is solvable by linear algebra, and a brute-force search over all states is a completely different way to get the same number.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Timezone meeting finder | Real daily use, easy oracle with Python `zoneinfo` | Another utility; Originality would be low again |
| Nonogram / sudoku generator | Familiar, uniqueness is checkable | Standard puzzle; the oracle is a known solver |
| Word-ladder explorer | Text domain | Needs a word list (licence, size) |
| Stamp Lights | Per-puzzle stamp is a small fresh twist; exact minimum; oracle is simple | Lights-Out family already exists |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Solver | GF(2) elimination with BigInt rows | Brute force in JS | Scales to 6x6 (36 cells) instantly |
| Minimum | Enumerate all free-variable choices (cap 20) | Heuristic | Exactness is the claim |
| Puzzle creation | Scramble a solved board with random presses | Random boards plus a solvability filter | Always solvable by construction |
| Edges | Clip the stamp | Wrap around (torus) | Clipping gives non-trivial nullities and is easier to picture |
| Seed | UTC date for the daily puzzle | Server | Static site |

## Deliberately left out

Sound, animations beyond a glow, score saving, a wrap-around mode, custom stamps, and a puzzle-difficulty model beyond the minimum press count.

Related: [[Stamp Lights]] · [[Stamp Lights - Build Log]] · [[Stamp Lights - How It Works]]
