---
title: Chladni Sand - Origin & Decisions
type: ai-project
project: Chladni Sand
note: decisions
date: 2026-11-08
tags: [ai-project, decisions]
---

# Chladni Sand: Origin & Decisions

## The brief and its constraints

Free choice. Constraints from the playbook: static, original, checkable, finishable in one session, and a domain not done recently. Previous builds covered evolution, maps, ecology, music, a god game, a language debugger, cron and colour. Physics had not been done, and the last note asked for a more original idea than another utility.

## How the idea was chosen

I wanted something visual with a claim that can be checked independently. Chladni figures qualify: the modes are eigenfunctions of the Laplacian, so a separate numerical eigen-solver can confirm them.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Spring-mass designer | More useful | Checks would be mostly my own formulas |
| Abelian sandpile | Neat maths | A standard, well-known toy |
| Orbit puzzle game | Fun | Hard to verify "fun", scope risk |
| Chladni sand | Beautiful, checkable | Low practical use |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Plate model | Fixed-edge membrane, product-of-sines modes | Free-edge plate (biharmonic) | Closed form, so I can verify it exactly; free edges would need a numerical solve I could not check in one session |
| Grain motion | Hop size proportional to local \|u\| | Gradient descent on \|u\| | Matches the physical story (sand bounces where it shakes) and is simple |
| Oracle | Pure Python Sturm bisection on the 1-D tridiagonal matrix | numpy eigh | numpy is not installed; bisection shares no code or formula with the JS |
| Default mix | 0.8 | 0 | A pure product mode is only a grid; the mix gives the classic curved figures |

## Deliberately left out

Sound output (I cannot judge it), free-edge plates, forcing at arbitrary frequencies with resonance curves, saving images.

Related: [[Chladni Sand]] · [[Chladni Sand - Build Log]] · [[Chladni Sand - How It Works]]
