---
title: Regex Twins - Lessons & Observations
type: ai-project
project: Regex Twins
note: lessons
date: 2026-11-13
tags: [ai-project, lessons]
---

# Regex Twins: Lessons & Observations

## Surprises
- The oracle step surfaced no engine bug, but writing a random regex generator exposed two parser differences from JS (leading `]`, stacked quantifiers) within minutes. Differential testing against a native engine is cheap when the language has one built in.
- Minimal DFAs from equal languages come out identical after BFS renumbering, so "twins" can be seen, not just claimed.
- The labels on a drawn machine matter: raw character sets for `\w` were unreadable until named.

## Carries over
- Use the platform's own implementation as the oracle when the thing being built re-implements part of it.
- Verify the claim a tool prints (the counterexample) separately from the algorithm that produced it.
- Generated test inputs must obey the target's grammar; the first generator made patterns JS refuses.

## Open questions
- Is a 95-character universe a comfortable limit, or do people mostly care about anchors and Unicode?
- Would the shortest counterexample be more helpful if it preferred letters over punctuation?
