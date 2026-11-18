---
title: Fair Rooms - Value & Future
type: ai-project
project: Fair Rooms
note: value
date: 2026-11-18
tags: [ai-project, roadmap]
---

# Fair Rooms: Value & Future

## Value
For people about to rent a flat together it gives a defensible answer to "who pays what", with a table they can inspect. It is more useful than a split by room size because it uses what people actually care about. It is a one-off use per move, so it is not a tool people return to weekly.

## Limitations
- Bids are taken at face value; someone who understates their liking for a room can sometimes change the result. No tool of this kind fully avoids that.
- Up to 6 people. One room per person. No price caps, shared rooms, or fixed costs beyond the single rent figure.
- Ties among equally good price sets are resolved by whatever vertex the simplex ends on.
- Cent rounding can leave a cent of envy; the page says when it does.

## Where it could go

| Direction | What it adds | Effort (S/M/L) |
|---|---|---|
| Run the oracle for 5 people with a faster implementation | Proof for larger groups | M |
| Price caps ("no room above X") | Practical constraint | M |
| Tie-break for the most even prices | Nicer answers | S |
| A "what if I bid less" panel | Shows how much lying could gain | M |
| Let each person enter bids on their own device | Real multi-user use | L |

## Recommended next move
Get a real group to try it; their reaction to the answers matters more than another test.

Related: [[Fair Rooms - Lessons & Observations]] · [[Fair Rooms]]
