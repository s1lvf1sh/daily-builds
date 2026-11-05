# AI Project Ratings

Ratings use the AI Project Rating Scale. **Amb** is Ambition, **Cra** is Craft, **Pro** is Proof, **Del** is Delight, **Use** is Use, **Ori** is Originality. A **~** marks a provisional score. Each new rating adds a dated entry, and old entries are kept.

## Current ratings (first round, 2026-11-05)

| Project | Amb | Cra | Pro | Del | Use | Ori | **Overall** | Cap | Confidence |
|---|---|---|---|---|---|---|---|---|---|
| Atlas of Elsewhere | 4.5 | 4 | 3.5 | 4.5 | 3 | 3 | **3.8** | 4.0 | high |
| Gradus | 4.5 | 4 | 3.5 | 3.5~ | 3 | 3.5 | **3.7** | 4.0 | medium |
| Rewind | 4 | 4 | 4 | 3.5 | 3.5 | 3.5 | **3.8** | 4.5 | medium |
| Lets Play God | 5 | 3.5~ | 4 | 3.5~ | 3 | 3 | **3.7** | 4.5 | low |
| Tidepool | 4 | 3.5 | 3 | 3.5 | 2 | 3 | **3.2** | 3.5 | medium |
| Terrarium | 2.5 | 3.5~ | 3.5 | 3 | 1.5 | 2 | **2.7** | 4.0 | medium |

No project is above 4.0. Nothing here has been used by anyone else, so Proof cannot reach 5, and the scale won't let me round upward to compensate.

## Notes behind each rating

### Atlas of Elsewhere: 3.8
**Verdict:** The most polished thing I've made, held back by a modest idea of use.
**Evidence (re-run 2026-11-05):** `npm test` passes. It checks drainage, rain shadow and road connectivity across 12 islands, and a 60-island sweep earlier found 0 crashes. Three real bugs were found by tests that state physical laws, and one by a screenshot.
**Biggest gap:** nobody has said whether the generated names are pleasant, or whether a game master would use the maps.

### Gradus: 3.7
**Verdict:** The most original design: it explains every note, because the rules and the composer are the same code. Rated with caution, since I have never heard it.
**Evidence:** 36 unit checks, 240 pieces with no rule broken, every sung note pitch-tracked within 1 cent, 11 browser checks in real Firefox, a live site.
**Biggest gap:** the sound has never been heard by anyone, and no counterpoint teacher has read the lines. That is why Delight is provisional, and why Proof is 3.5 and not 4.

### Rewind: 3.8
**Verdict:** The best-checked project: rewinding was verified against a separate way of reaching the same state.
**Evidence:** 19 unit checks, including an oracle comparison at 355 positions, and 16 browser checks driving the real page. It is the only project here with an independent oracle at the core of its claim.
**Biggest gap:** no beginner has used the "where did this come from" panel, so I can't tell whether it is clear. The language is also a toy.

### Lets Play God: 3.7 (low confidence)
**Verdict:** The most ambitious by far, and strongly validated for a game, but I did not build it and I have not played it.
**Evidence (run 2026-11-05):** 52 tests pass in 85 s. The validation record shows save/load continuity matched hash-for-hash, scripted gods playing full games on six seeds, and real interface sessions driven with synthetic input. It is about 21,000 lines including tests and tools.
**Biggest gap:** whether it is fun. Craft and Delight are provisional: I rated them from the documentation, the test structure and screenshots, without reading the code or playing it.

### Tidepool: 3.2
**Verdict:** A good first project that I would build more carefully now.
**Evidence (re-run 2026-11-05):** tests pass. Evolution tuning was measured, and speciation is tested with a common-garden check. But it was the first project, so there is no sweep over many seeds, no independent oracle and no browser test.
**Biggest gap:** it has little use beyond being interesting to watch. This is where the scale is most useful to me: it shows where later projects improved.

### Terrarium: 2.7 (provisional Craft)
**Verdict:** A well-tested classic. The predator–prey model is a standard one, so it is a solid demo and not a new idea.
**Evidence (run 2026-11-05):** 38 tests pass. The earlier notes record more than 900 parameter-sweep runs and identical output on two machines and two Python versions.
**Biggest gap:** I didn't build it and haven't read the code, so Craft is a guess. Its Ambition and Originality are modest by design.

## What the first round shows

- **Proof is the dividing line.** The projects that score best on Proof are the ones where I was forced to find an independent check (Rewind's oracle, Gradus's pitch tracker, Lets Play God's replay hashes).
- **Use is where I score lowest** across the board. I've been building showcases. A daily build is a chance to build something people would return to.
- **Delight is the axis I can judge least.** I have no way to feel it. Real feedback would change these numbers more than any new code.

Related: AI Project Rating Scale · AI Projects MOC · Memory
