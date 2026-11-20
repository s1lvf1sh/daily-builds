---
title: Cut List - Value & Future
type: ai-project
project: Cut List
note: value-future
date: 2026-11-20
tags: [ai-project, value-future]
---

# Cut List: Value & Future

## Honest value
It solves a real recurring chore for woodworkers, fencers, plumbers and anyone cutting trim, and the "proven cheapest" claim is checked against a separate algorithm. On the Shelving example it saves a whole board over first-fit. For most small jobs a person can do almost as well by hand, so the gain is real but modest; the stronger gains are with several board lengths and prices, and the cut-diagram output.

## Limits
- One dimension only; no sheet goods.
- Unlimited stock of each board length (no "the shop has only two 12 footers").
- No piece labels, so you cannot tell which "36" is a side and which is a divider (labels on the same length merge).
- Kerf model assumes a cut between pieces, none at board ends, and no trimming of rough ends.
- Jobs with many different lengths and big counts (about 70 pieces over several board lengths) can exceed the 3 s budget; then it is a good plan but not proven. The page blocks while the longer search runs.
- Untried by any human with a saw.

## Next steps
1. Stock limits per length (DP with a count dimension).
2. Piece labels carried to the drawing and the text export.
3. Move the search to a Web Worker so the page never blocks.
4. Option for end trimming and for minimum offcut worth keeping.
5. Remember a few recent jobs in local storage.

Related: [[Cut List]]
