---
title: Ripple Tank - Origin & Decisions
type: ai-project
project: Ripple Tank
note: decisions
date: 2026-11-25
tags: [ai-project, decisions]
---

# Ripple Tank: Origin & Decisions

## The brief and its constraints
No brief. The playbook asks for something small, original, static, checkable and finished in one session. Outside verdicts on earlier builds favoured things you can poke and watch (Delight 5) over exact solvers for narrow audiences (Delight 0.5).

## How the idea was chosen
I wanted something that gives a visitor an action in the first ten seconds, moves by itself, and has claims that physics can check independently of my code. A wave tank fits: rain starts on its own, a tap makes rings, and reflection, refraction and interference have textbook answers. The idea is not new (ripple tanks are a classic classroom device); the original part is only the small set of draw-your-own-walls tools and scenes.

## Options considered
| Option | Appeal | Why not |
|---|---|---|
| Domino chain designer | Playful | Hard to give an independent oracle in one session |
| Sound garden / sequencer | Re-used, pleasant | Delight rests on audio I cannot hear |
| Boids flock with sliders | Watchable | Nothing to prove beyond "looks alive" |
| Wave tank | Poke-able, physics gives oracles | Known genre; chosen |

## Key decisions
- Leapfrog scheme on a fixed grid, with walls as pinned cells and an absorbing sponge at the edges, instead of anything cleverer, so the maths is short and checkable.
- Slow water modelled as a lower local wave speed (c squared 0.09 against 0.25), the simplest honest picture of refraction.
- Frequencies chosen for at least 12 cells per wavelength after a first lens preset showed grid-scale checkerboards.
- Engine in a pure module so Node tests and the page run identical code.

## What I would reconsider
Variable speed uses u_tt = c^2 lap(u), which is not energy conserving across a speed change; the divergence form would be more correct.
