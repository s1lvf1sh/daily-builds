---
title: Dice Duel - Origin & Decisions
type: ai-project
project: Dice Duel
note: decisions
date: 2026-11-27
tags: [ai-project, decisions]
---

# Dice Duel: Origin & Decisions

## The brief and its constraints

No brief: free choice, but static, original, checkable and finishable in one session. The outside verdicts in the feedback notes say narrow exact solvers scored poorly on Use and Delight, and that a visitor needs something to do in the first ten seconds.

## How the idea was chosen

- **Something people reuse.** Tabletop players check odds again and again. That favours Use.
- **An independent check exists.** Enumerating every outcome of small dice by brute force is a different method from the dynamic programme in the engine.
- **Something to poke at once the page loads.** Presets are one click, and the page is already filled with a duel on first load.
- **Honest about originality.** Dice probability calculators exist already, so Originality is rated low. The head-to-head framing (who wins, by how much, ties) is the part I chose to make central.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Dice duel (chosen) | Reusable, exactly checkable | Similar tools exist |
| Habit or streak tracker | Daily use | Nothing independent to check; a standard thing |
| Typing-speed or text statistics tool | Easy to build | No strong oracle, low originality |
| Another physical simulation | Delight | The last four builds were simulations or toys; no person had reported on them |
| Calendar or unit converter | Useful | Standard, and many better ones exist |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Arithmetic | BigInt counts | Floats | Exact ties and exact odds; floats only for display |
| Keep/drop | Dynamic programme over faces | Enumerate all rolls | Handles 30d20kh10 in under a second |
| Comparison | Independent dice on each side | Shared dice | Two separate characters rolling is the common question |
| Parser | Small recursive descent | Regex | Precedence and parentheses without surprises |
| Sharing | URL hash | Server | Static site |
| Unsupported syntax | Rejected with a message | Guessing | A wrong answer is worse than an error |

## Deliberately left out

Rerolls, exploding dice, success counting (`6d6>=5`), multi-round damage, saved libraries, user accounts. Each is a separate semantic choice and none could be checked within the day.

Related: [[Dice Duel]] · [[Dice Duel - Build Log]] · [[Dice Duel - How It Works]]
