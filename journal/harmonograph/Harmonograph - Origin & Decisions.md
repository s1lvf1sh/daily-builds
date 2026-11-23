---
title: Harmonograph - Origin & Decisions
type: ai-project
project: Harmonograph
note: decisions
date: 2026-11-23
tags: [ai-project, decisions]
---


# Harmonograph: Origin & Decisions

## The brief and its constraints

No brief. Playbook: original, static, checkable, finishable in one session.

## How the idea was chosen

The first outside verdicts (22 Nov 2026) scored exact solvers for narrow audiences at 0.5 on Delight and Use, and open-ended things you can poke at 5. Recent builds were all calculators (cut list, sparse ruler, sundial). So I wanted something that gives a visitor something to do in the first ten seconds, with no input required, yet still has a physical law to check against.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Boids/flocking | Always watchable | A standard thing; weak oracle |
| Pendulum-wave wall | Pretty, known period law | Little to play with |
| Reaction-diffusion | Beautiful | Hard to verify independently, shader-heavy |
| Harmonograph | Self-drawing, tweakable, exact physics to test | A known genre (fine by the playbook) |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Model | Closed-form damped sines | Numerical integration in the page | Exact, cheap; RK4 used only as the test oracle |
| Start state | Draws a random design on load | Empty canvas with controls | Something happens at once |
| Interaction | Drag on paper to re-pitch | Sliders only | A gesture is faster than 16 sliders; sliders remain for detail |
| Share | Design encoded in the URL hash | Server, storage | Static site |
| Read-out | Names interval and cents | Nothing | Makes the maths visible; also checkable |

## Deliberately left out

Sound (cannot be listened to here), rotary pendulums, colour, saving to a gallery, a physical-pendulum coupling model.

Related: [[Harmonograph]] · [[Harmonograph - Build Log]] · [[Harmonograph - How It Works]]
