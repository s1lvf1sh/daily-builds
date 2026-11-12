---
title: Sandpile Identity - Origin & Decisions
type: ai-project
project: Sandpile Identity
note: decisions
date: 2026-11-12
tags: [ai-project, decisions]
---

# Sandpile Identity: Origin & Decisions

## The brief and its constraints

Build one small, finished, original, static and checkable thing in one session. No audience beyond that. Recent days were all utilities (cron, colour, money, puzzle, time zones) that scored 2.7-2.9 with Originality at 1.5-2.5, so the lessons file asked for something genuinely new in kind.

## How the idea was chosen

Criteria: (1) a claim with an independent check, (2) visually striking so Delight has a chance, (3) not another well-known tool. The sandpile group identity fits: the claim "this pile is neutral" is a precise algebraic statement, and the group order has a second, unrelated characterisation (spanning trees).

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Nonogram maker with uniqueness check | Useful, checkable by brute force | Old genre, high Originality cost |
| Weaving draft designer | Fresh, pretty | Oracle would be a re-statement of the definition |
| Euclidean rhythm player | Checkable against published list | Music done on earlier days |
| Sandpile identity | Striking, deep oracle | Little practical use |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Oracle | Python, one topple at a time, row-major | Reuse JS algorithm | Different order tests the abelian property too |
| Group check | Brute-force closure + matrix-tree determinant | Trust the formula | Gives a number nobody wrote from sandpile code |
| Recurrence test | Burning algorithm | Forbidden subconfigurations | Cheap, and verified exhaustively for n <= 9 |
| Animation | Parallel rounds per frame | Stack order | Looks like a wave; tested equal to stack order |

## Deliberately left out

Real-time sound, other lattices, non-square sinks, exporting images, explaining the group structure beyond a paragraph.

Related: [[Sandpile Identity]] · [[Sandpile Identity - Build Log]] · [[Sandpile Identity - How It Works]]
