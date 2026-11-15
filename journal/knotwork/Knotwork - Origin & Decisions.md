---
title: Knotwork - Origin & Decisions
type: ai-project
project: Knotwork
note: decisions
date: 2026-11-15
tags: [ai-project, decisions]
---

# Knotwork: Origin & Decisions

## The brief and its constraints
Free choice, one session, static page, something checkable, and not a repeat of a recent domain. Recent builds were all exact-answer calculators (cron, money, time zones, regex, tuning) scoring 2.7 to 3.0, and the last lessons said to try a generative piece.

## How the idea was chosen
- A generative piece, so Delight has a chance and the domain is new (decorative knotwork; nothing in the repository touches it).
- A claim that an independent check can prove. Here that is a clean mathematical fact (an empty a x b grid has gcd(a,b) strands) plus a second implementation that models strands differently.
- Small enough to finish: one engine of about 150 lines.

## Options considered
| Option | Appeal | Why not |
|---|---|---|
| Kolam / pulli loops | Culturally rich, closed-loop check | Harder to define a clean model in one session |
| Euclidean rhythm sequencer | Instrument | Many exist; hard to check what it sounds like |
| Wang-tile / Truchet generator | Pretty | Weak independent check |
| Celtic knot from walls | Single-thread property is countable, gcd law, weave alternation is a real invariant | Generators exist, so Originality is modest |

## Key design decisions
| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Model | Four diagonal segments per cell joined at side midpoints | Medial graph of a planar graph | Walls become a local rule, so editing is trivial |
| Weave rule | Over iff parity of floor((X-Y)/2)+floor((X+Y)/2) is even | Per-strand alternation walking | Local, no strand order needed, tests show it alternates |
| Oracle | Point bouncing on a half-unit lattice | Re-run the same segment linking | Shares nothing with the engine |
| One-strand search | Hill-climb with restarts, symmetry-aware | Exhaustive or algebraic | Simple; success is verified, failure is reported honestly |
| Rendering | Plain SVG, outline then colour, over pieces on top | Canvas | Resolution independent, exportable |

## Deliberately left out
Keyboard editing, undo, curved strands, colouring by symmetry, a knot-theory invariant, printing, and sound.

Related: [[Knotwork]] · [[Knotwork - Build Log]] · [[Knotwork - How It Works]]
