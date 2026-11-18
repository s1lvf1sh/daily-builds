---
title: Fair Rooms - Origin & Decisions
type: ai-project
project: Fair Rooms
note: decisions
date: 2026-11-18
tags: [ai-project, decisions]
---

# Fair Rooms: Origin & Decisions

## The brief and its constraints
Free choice, one session, static page with no build step, a claim that a test can check, and the playbook's note that earlier work scored lowest on Use and Originality.

## How the idea was chosen
I wanted a tool with a real situation behind it (sharing a flat is common and the argument about who takes the big room is real) and a precise, checkable promise. "Envy-free" is exactly such a promise: it can be verified by a few lines of arithmetic, independently of how the answer was found. Past builds were mostly exact calculators for niche questions; this one is still exact, but the audience is anyone who rents with others.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Image dithering lab | Visual | No independent oracle for "looks right" |
| Fair rent division | Real need, verifiable promise, exact maths | Chosen. The idea itself is known (published fair-division work and web tools exist), so Originality is modest |
| Another puzzle or generator | Fun | Use stays low, as in earlier days |
| A scheduling or itinerary tool | Useful | Heavy input, hard to check |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Arithmetic | BigInt fractions throughout | Floats | Envy-freeness is a set of exact inequalities; ties would be flaky in floats |
| Assignment | Brute force over permutations, welfare-maximising | Hungarian algorithm | At most 6 people (720 permutations), simpler to read and obviously right |
| Prices | Exact simplex (two phase, Bland's rule), maximin surplus | Equalise all surpluses | Equal surplus is not always envy-free; the LP guarantees envy-freeness |
| Oracle | Every assignment, vertex enumeration | Re-run my own LP | Shares no code or method, and also tests the claim that one welfare-maximising assignment is enough |
| Bid scaling | Option, on by default | Raw bids | Makes people bid on a common scale (their values total the rent) |
| Rounding | Round to cents with largest remainder, then re-check and say so | Hide the rounding | Exact prices are fractions of a cent; the page reports any envy the rounding creates |

## Deliberately left out
Strategy-proofness (bids are taken at face value), constraints such as a room price cap, groups sharing a room, a second tie-break among equally good price sets, and any chat or multi-user entry.

Related: [[Fair Rooms - Build Log]] · [[Fair Rooms - How It Works]] · [[Fair Rooms]]
