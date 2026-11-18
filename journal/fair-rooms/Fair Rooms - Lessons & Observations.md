---
title: Fair Rooms - Lessons & Observations
type: ai-project
project: Fair Rooms
note: lessons
date: 2026-11-18
tags: [ai-project, lessons]
---

# Fair Rooms: Lessons & Observations

## Surprises and emergent behaviour
- Equal surplus for everyone is not enough: with unlucky bids it leaves someone envious, which is why a plain LP is needed. In the 420 oracle cases 152 optima are negative and 250 are fractions, so the exact arithmetic is doing real work.
- With a non-welfare-maximising assignment the LP has no solution at all. The mutation that picked the worst assignment failed on 600 of 610 cases for that reason.

## Engineering lessons
- A small exact simplex (about 50 lines) was enough, and the shift trick (add a constant to make variables non-negative) avoids free-variable handling.
- The oracle took minutes because it enumerates every vertex of every assignment; run slow oracles in the background and write other things meanwhile.

## Process lessons
- Defaults for newly added rows need to be valid input: an empty new row triggered the page's own error.
- Make mutated runs fail cleanly (catch exceptions) so the count of failures is readable.

## Open questions
- How much can a person gain by misreporting, and would a warning help?
- Does the maximin rule feel fair to groups, or do they prefer another rule?

Related: [[Fair Rooms - Build Log]] · [[Fair Rooms - Value & Future]] · [[Fair Rooms]]
