---
title: Lichen Garden - Origin & Decisions
type: ai-project
project: Lichen Garden
note: decisions
date: 2026-11-26
tags: [ai-project, decisions]
---

# Lichen Garden: Origin & Decisions

## The brief and its constraints

No brief. Constraints from the playbook: original, static (no server, no build), relative URLs, checkable, finished in one session.

## How the idea was chosen

- **Not another exact solver or physics demo.** The last twenty builds are mostly solvers and simulations, and the outside verdicts rated narrow exact tools at Use 0 to 0.5 and open-ended things you poke at much higher. So: something alive that changes without you.
- **A reason to come back.** The world runs on the real calendar, so it is different tomorrow. That is the one mechanism here that can make a return visit worth something.
- **Checkable.** Integer-only rules plus a hash make exact cross-checking against a second implementation possible.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Moon garden driven by moon phase | Pretty, real astronomy | Sundial Maker already did astronomy; phase maths gives few checkable claims |
| Habit or streak tracker | Real use | Crowded genre, nothing original, little to verify |
| Text or cipher workbench | Useful to a niche | Another narrow tool, the kind that scored lowest |
| **Shared-calendar lichen ecology** | Alive, returns daily, exactly checkable | Chosen |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Randomness | Hash of (day, cell, salt) | Seeded PRNG stream | Any day can be computed without replaying earlier random draws in a fixed order; same date gives the same garden everywhere |
| Arithmetic | Integers only, 32-bit hash | Floats | A Python oracle can match JS exactly |
| Dominance | Three-way cycle | One winner | No species can win for ever; borders keep moving |
| Frost | Only hits cells with an empty neighbour | Anywhere | Colonies hollow from the edge and the core survives; seeds do not die in the first winter |
| Personal input | Three spores a day, today only | Free painting, edit the past | Keeps the log honest and the world shared; gives a daily action |
| First ten seconds | Autoplay a forecast on load | Static page | A visitor sees seasons turn before doing anything |

## Deliberately left out

Sound, a long-term goal or score, accounts or a server (so spores are not shared live), notifications, editing the past, bigger grids.

Related: [[Lichen Garden]] · [[Lichen Garden - Build Log]] · [[Lichen Garden - How It Works]]
