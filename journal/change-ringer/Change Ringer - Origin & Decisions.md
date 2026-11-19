---
title: Change Ringer - Origin & Decisions
type: ai-project
project: Change Ringer
note: decisions
date: 2026-11-19
tags: [ai-project, decisions]
---

# Change Ringer: Origin & Decisions

## The brief and its constraints
Free choice. Constraints from the playbook: static HTML/CSS/JS, relative URLs, one session, something checkable, original, and a domain not done recently. Earlier lessons said scores were stuck near 3.0 because Use and Originality stay low for known-algorithm wrappers.

## How the idea was chosen
- **Fresh domain.** Thirteen earlier builds cover evolution, maps, music, time zones, voting, folding, fair division and more. Nothing touched ringing patterns or permutation groups as a craft.
- **A checkable claim.** "Is this touch true?" is a plain definition (no row repeats, ends in rounds) that an independent program can recompute, and "which call sequences are true" can be brute-forced exhaustively for small methods.
- **Real users exist.** Ringers write and check compositions; a visual truth checker with the blue line is a thing they actually use, which is better for Use than a toy.
- **Facts from outside to check against.** Plain Bob plain-course lengths (24, 40, 60, 112) are published numbers I did not derive from my own code.

## Options considered

| Option | Appeal | Why not |
|---|---|---|
| Nonogram maker/solver | Familiar tool people return to | A known genre, low originality |
| Rhythm polyrhythm/Euclidean explorer | Sound plus maths | Audio could not be judged; many similar toys |
| Cellular lace/bobbin patterns | Pretty | Hard to state a checkable claim |
| Change ringing truth checker and finder | New domain, exact claim, real audience | Chosen |

## Key design decisions

| Decision | Chose | Alternatives | Why |
|---|---|---|---|
| Call model | A call replaces the last change of a lead | Arbitrary position and length (Grandsire, Stedman) | Covers Plain Bob and its relatives; keeps the search simple. Stated as a limit |
| Truth rule | R0..R(N-1) distinct if it ends in rounds, else R0..RN distinct | Count the closing rounds as a repeat | Matches how ringers speak: rounds at the end is not a fault |
| Search | Depth-first over calls with a seen-set and a step budget | Group-theory course heads | Simple, exhaustive for small cases, easy to oracle-check |
| Row encoding | Integer key per row | Strings | Fast set lookups in the search (about 200k steps in 0.3 s for Minor) |
| Stage | 4 to 8 bells | Up to 12 | 8! rows is already large to draw; the page limits drawn rows to 1500 |
| Oracle | Python from the definition, plus exhaustive 3^k enumeration | Compare with a published library | No network library available; exhaustive enumeration shares no search logic |

## Deliberately left out
Methods whose calls are not last-change replacements; other call positions; spliced methods; a method library; Stedman and Grandsire; audio realism (bell timbre, handstroke gaps); saving compositions.

Related: [[Change Ringer]] · [[Change Ringer - Build Log]] · [[Change Ringer - How It Works]]
