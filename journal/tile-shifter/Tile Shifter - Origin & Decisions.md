---
title: Tile Shifter - Origin & Decisions
type: ai-project
project: Tile Shifter
note: decisions
date: 2026-11-24
tags: [ai-project, decisions]
---

# Tile Shifter: Origin & Decisions

## The brief and its constraints
No brief. The playbook asks for something small, original, static, checkable and finished in one session. The earlier outside verdicts said exact solvers for narrow audiences got Delight 0.5 and Use under 1.5, while open-ended things you can poke (a tidepool, a god game) got Delight 5.

## How the idea was chosen
I wanted something with an immediate action in the first ten seconds (drag a dot), with visible, surprising output, and a claim a test could prove independently ("the shapes tile the plane"). Tessellation editors exist, but the combination of live twin-edge editing, a legality guard, shareable links and cut-ready SVG is a modest fresh mix.

## Options considered
| Option | Appeal | Why not |
|---|---|---|
| Euclidean rhythm sequencer | Re-used weekly, sound | Very well known; Delight rests on audio I cannot hear |
| Pendulum wave / more physics art | Easy to check | Harmonograph was yesterday |
| Marble-run physics toy | Playful | Hard to give an independent oracle in one session |
| Tile Shifter | Playful, exact claim, printable output | Escher-style editors exist, so Originality is modest |

## Key design decisions
| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Tilings supported | Translation only, hexagon and parallelogram | Rotations, glides, 17 wallpaper groups | Finishable and fully checkable today |
| Edge curves | Uniform Catmull-Rom through dots, flattened to a polygon | Beziers | Dots lie on the curve, so dragging is direct; one polygon is used for drawing and testing |
| Illegal drags | Refuse and keep the last good tile | Allow and warn | The tiling is never wrong on screen |
| Test oracle | Winding number, shoelace, Monte Carlo | Re-run the engine | Shares no logic with the engine's crossing-parity test |
| Share | Short string in the URL hash | Server | Static site |

## Deliberately left out
Rotation and glide-reflection edges, freehand drawing on the tile (so no creature faces), saving to a gallery, print layout, sound.

Related: [[Tile Shifter]] · [[Tile Shifter - Build Log]] · [[Tile Shifter - How It Works]]
