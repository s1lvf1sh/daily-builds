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

## Daily builds

| Date | Project | Amb | Cra | Pro | Del | Use | Ori | **Overall** | Cap | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-06 | Cronwise | 2.5 | 3.5 | 3.5 | 3~ | 3 | 2 | **2.9** | 4.0 | medium |
| 2026-11-07 | Tonal Ladder | 2.5 | 3.5 | 3.5 | 3~ | 3 | 2 | **2.9** | 4.0 | medium |
| 2026-11-08 | Chladni Sand | 2.5 | 3.5 | 3.5 | 3~ | 1.5 | 2.5 | **2.8** | 4.0 | medium |
| 2026-11-09 | Even Split | 2 | 3.5 | 3.5 | 3~ | 3 | 1.5 | **2.8** | 4.0 | medium |
| 2026-11-10 | Stamp Lights | 2 | 3.5 | 3.5 | 3~ | 2 | 2 | **2.7** | 4.0 | medium |
| 2026-11-11 | Overlap | 2.5 | 3.5 | 3.5 | 3~ | 3 | 1.5 | **2.8** | 4.0 | medium |
| 2026-11-12 | Sandpile Identity | 2.5 | 3.5 | 3.5 | 3~ | 1.5 | 3 | **2.8** | 4.0 | medium |
| 2026-11-13 | Regex Twins | 3 | 3.5 | 3.5 | 3~ | 2.5 | 2.5 | **3.0** | 4.0 | medium |
| 2026-11-14 | Tuning Fit | 2 | 3 | 3.5 | 3~ | 2.5 | 2.5 | **2.8** | 4.0 | medium |
| 2026-11-15 | Knotwork | 2.5 | 3.5 | 3.5 | 3.5~ | 2 | 3 | **3.0** | 4.0 | medium |
| 2026-11-16 | Rankwise | 2.5 | 3.5 | 3.5 | 3~ | 3 | 2 | **2.9** | 4.0 | medium |
| 2026-11-17 | Strip Folds | 2.5 | 3.5 | 3.5 | 3~ | 2.5 | 3 | **3.0** | 4.0 | medium |
| 2026-11-18 | Fair Rooms | 3 | 3.5 | 3.5 | 3~ | 3 | 2.5 | **3.1** | 4.0 | medium |
| 2026-11-19 | Change Ringer | 2.5 | 3.5 | 3.5 | 3~ | 2 | 3 | **2.9** | 4.0 | medium |
| 2026-11-20 | Cut List | 2.5 | 3.5 | 3.5 | 3~ | 3 | 2 | **2.9** | 4.0 | medium |
| 2026-11-21 | Sparse Ruler | 2 | 3.5 | 3.5 | 3~ | 2 | 2.5 | **2.8** | 4.0 | medium |
| 2026-11-22 | Sundial Maker | 2.5 | 3.5 | 3.5 | 3.5~ | 2.5 | 2.5 | **3.0** | 4.0 | medium |

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

### Cronwise: 2.9 (2026-11-06)
**Verdict:** A small, correct, useful tool that is not a new idea.
**Evidence:** 444 checks pass, including 413 expressions × 6 run times compared with an independent Python implementation, a minute-by-minute brute-force cross-check, and 11 checks driving the page in headless Chromium. Breaking the day rule on purpose made 111 checks fail. Proof is 3.5 and not 4 because the oracle has the same author as the code and I wrote the cron semantics from memory, with no comparison against a real crond.
**Biggest gap:** no other person has used it, and cron explainers already exist (Originality 2). Delight is provisional: judged from screenshots only, in one browser.

### Tonal Ladder: 2.9 (2026-11-07)
**Verdict:** A small, correct tool built on one neat piece of algebra, but the idea already exists elsewhere.
**Evidence:** 664 checks pass, including 108 ramps compared with an independent Python implementation that works from hex strings alone (worst pair-contrast error 1.15%, hue drift 3.2°), and 9 checks in headless Chromium plus a screenshot. Two deliberate bugs made 217 and 92 checks fail. Proof is 3.5 and not 4 because the oracle shares an author with the code and the contrast formula was never compared with a third-party checker.
**Biggest gap:** no designer has used it, so Use is a guess, and Delight is provisional (one browser, one viewport, judged from a screenshot).

## What the first round shows

- **Proof is the dividing line.** The projects that score best on Proof are the ones where I was forced to find an independent check (Rewind's oracle, Gradus's pitch tracker, Lets Play God's replay hashes).
- **Use is where I score lowest** across the board. I've been building showcases. A daily build is a chance to build something people would return to.
- **Delight is the axis I can judge least.** I have no way to feel it. Real feedback would change these numbers more than any new code.

Related: AI Project Rating Scale · AI Projects MOC · Memory

### Chladni Sand: 2.8 (2026-11-08)
**Verdict:** A pretty, well-checked physics toy with little practical use.
**Evidence:** 28 Node checks pass. A pure-Python oracle (Sturm bisection, no shared code) confirms the mode eigenvalues to 1.2% and that 12 fields are discrete Laplacian eigenvectors (residual about 1e-12). Two deliberate mutations are caught (12 and 4 failures). 7 headless Chromium checks pass and I inspected the desktop screenshot. Proof is 3.5, not 4: the oracle checks the maths of the modes, not that the figures look like real plates.
**Scores:** Use 1.5 (a toy), Originality 2.5 (Chladni simulations exist; the mixing slider and oracle are the fresh parts), Delight provisional because nobody has watched the animation.
**Biggest gap:** it models a fixed-edge membrane, not a real free-edge plate, and no person has tried it.

### Even Split: 2.8 (2026-11-09)
**Verdict:** A small, exact, useful tool in a very familiar category.
**Evidence:** 2734 Node checks pass, including 400 seeded scenarios compared with an independent Python oracle (exact-fraction balances; a different search for the minimum payment count). Two deliberate mutations were caught (636 failures; oracle count mismatches). 12 checks in headless Chromium plus desktop and mobile screenshots. Proof is 3.5, not 4: the oracle shares one lemma with the code and covers only simple weights, and the real-environment check was one browser.
**Scores:** Ambition 2 (a known problem), Use 3 (a defined audience, but unused), Originality 1.5 (settle-up apps are standard), Delight provisional (one browser, screenshots only).
**Biggest gap:** nobody has tried the line syntax, and the idea is not new.

### Stamp Lights: 2.7 (2026-11-10)
**Verdict:** A tidy, exactly solved puzzle in an old genre, with a small twist and no players yet.
**Evidence:** 13 Node checks pass, including 150 seeded puzzles per level and an oracle sweep of 2480 boards (128 unsolvable) against an independent brute-force BFS, 0 disagreements. Three deliberate mutations were caught. 15 checks in headless Chromium, including following Hint to a win in exactly the advertised minimum; desktop and mobile screenshots read. Proof is 3.5, not 4: the oracle only reaches boards of 20 cells or fewer, so 5x5 and 6x6 minimality rests on the same algebra, and only Chromium was driven.
**Scores:** Ambition 2 (a known linear-algebra puzzle), Use 2 (a game nobody has played), Originality 2 (Lights-Out variant with a per-puzzle stamp), Delight provisional (judged from screenshots only).
**Biggest gap:** nobody has played it, so difficulty and fun are unjudged.

### Overlap: 2.8 (2026-11-11)
**Verdict:** A correct, clear utility for a real recurring question, with little that is new.
**Evidence:** 21 Node checks pass, including 160 random cases (half on 2026 DST dates, 20 zones, 103 with overlap and 57 without) compared with a minute-by-minute Python `zoneinfo` oracle: 0 disagreements after the oracle found and I fixed one real bug. Five deliberate mutations were each caught. 14 checks in headless Chromium plus desktop and phone screenshots read. Proof is 3.5, not 4: only 2026 was swept, the oracle and code read separate copies of tz data that could share a blind spot, and only Chromium was driven.
**Scores:** Ambition 2.5 (DST-exact interval maths plus a UI), Craft 3.5, Delight provisional (judged from screenshots only), Use 3 (real need for distributed teams, but unused by anyone), Originality 1.5 (many time-zone overlap planners exist).
**Biggest gap:** nobody has used it, so whether the answer and week strips are clear is unjudged.

### Sandpile Identity: 2.8 (2026-11-12)
**Verdict:** A striking, well-checked maths toy; little practical use and no users yet.
**Evidence:** 134 Node checks pass, including identity vs a slower independent oracle on 11 grid sizes, brute-force group identity and recurrent counts on five tiny grids matching the matrix-tree determinant (100352 for 3x3), and e+a=a sweeps to 61x61. Four mutations caught; one equivalent mutant survived. 17 checks in headless Chromium, desktop and phone screenshots read. Proof is 3.5, not 4: the oracle comparison stops at 25x13, same author, Chromium only.
**Scores:** Ambition 2.5, Craft 3.5, Proof 3.5, Delight 3~ (judged from screenshots), Use 1.5 (a toy), Originality 3 (sandpile images exist; the live identity check is the fresh part). Mean 2.83, so 2.8 (cap 4.0).
**Biggest gap:** no one has used it, and the identity is verified against an oracle only up to 25x13.

### Regex Twins: 3.0 (2026-11-13)
**Verdict:** A correct, exact tool for a real developer question, held back by a narrow syntax and no users.
**Evidence:** 800 Node checks pass, including about 20.6 million regex/string pairs compared with JavaScript's native `RegExp` (0 mismatches), 4000 verdicts compared with Python `re` (0 mismatches), and 200 equivalence pairs whose printed counterexamples were each re-run natively and checked shortest. Five mutations caught. 16 checks in headless Chromium plus desktop and phone screenshots read. Proof is 3.5, not 4: both parsers are mine so a shared misreading of syntax outside the generator's grammar is possible, "equal" verdicts are brute-forced only to length 6, and only Chromium was driven.
**Scores:** Ambition 3 (parser, NFA, DFA, minimiser, product search, counting, drawing), Craft 3.5, Proof 3.5, Delight 3~ (screenshots only), Use 2.5 (real need, but anchors, lookahead and Unicode are rejected), Originality 2.5 (equivalence checkers exist; the live counterexample, counts and drawing are the fresh combination). Mean 3.0 (cap 4.0).
**Biggest gap:** nobody has used it, and the supported syntax excludes much of what people write.

### Tuning Fit: 2.8 (2026-11-14)
**Verdict:** An exact, small tool for a niche question (which equal tuning fits these ratios), with untested sound and no users.
**Evidence:** 56 Node checks pass, including 6,715 cases compared with an exact big-integer oracle (0 mismatches, max 1.4e-12 cents), literature values for 12, 31 and 53 divisions, and brute-force record checks. Five of six mutations caught; the sixth is equivalent, and one survivor (RMS divisor) exposed a real gap that was then closed. 17 checks in headless Chromium plus a desktop screenshot read; the phone screenshot was only checked for horizontal overflow. Proof is 3.5, not 4: nobody has listened to the audio (I only recorded requested frequencies), only Chromium was driven, and the parser is mine.
**Scores:** Ambition 2 (known arithmetic, one engine, one page), Craft 3, Proof 3.5, Delight 3~ (screenshot only, sound unheard), Use 2.5 (real for microtonal hobbyists, narrow), Originality 2.5 (EDO calculators exist; arbitrary equave plus record-holders plus pure-vs-tempered playback is a modest combination). Mean 2.75, rounded up to 2.8 (cap 4.0).
**Biggest gap:** nobody has heard it or used it, so the audio and the usefulness are untested.

### Knotwork: 3.0 (2026-11-15)
**Verdict:** A pretty, mathematically grounded art toy that is checked well and used for little.
**Evidence:** 19 Node checks pass: gcd(a,b) strands for all 576 empty grids up to 24 x 24; 1,500 random wall layouts agree with an independent Python billiard oracle on strand count and every strand length; over/under alternates round every strand in both implementations; the one-strand search is confirmed by the oracle on 10 sizes. 16 checks in headless Chromium plus desktop, phone and multi-strand screenshots read. Three of four mutations were caught at once; the fourth exposed a weak test that I then fixed. Proof is 3.5, not 4: both implementations share my weave rule, only Chromium was driven, and nobody else has used it.
**Scores:** Ambition 2.5 (one model, solver, symmetry, share link), Craft 3.5, Proof 3.5, Delight 3.5~ (judged from screenshots only), Use 2 (art toy), Originality 3 (knot generators exist; wall-bounce model with a strand-count readout and solver is a fresh combination). Mean 3.0 (cap 4.0).
**Biggest gap:** nobody else has tried it, so whether the knots are enjoyable and whether anyone returns is untested.

### Rankwise: 2.9 (2026-11-16)
**Verdict:** A correct, readable comparison of voting rules for small groups, built on well-known methods and not yet used by anyone.
**Evidence:** 15 Node checks pass, including 2,830 random elections x 6 methods against an independent Python oracle (0 mismatches; 595 with disagreeing methods, 349 without a Condorcet winner, 410 with ties), Condorcet consistency on all 2,481 cases that have a Condorcet winner, and a published 45-voter Schulze example. All 8 mutations caught. 21 checks in headless Chromium plus desktop and phone screenshots read. Proof is 3.5, not 4: the oracle shares my rule conventions (partial ballots, IRV ties, Borda with ties), only Chromium was driven, and nobody else has used it.
**Scores:** Ambition 2.5 (six methods, parser and page, all standard), Craft 3.5, Proof 3.5, Delight 3~ (screenshots only), Use 3 (real group decisions, but one person enters all ballots), Originality 2 (voting calculators exist). Mean 2.92, so 2.9 (cap 4.0).
**Biggest gap:** nobody has used it, and my tie and partial-ballot conventions are unchecked against any outside implementation.

### Strip Folds: 3.0 (2026-11-17)
**Verdict:** A correct, small tool for a niche question (does this crease pattern fold flat), with a nice link to the dragon curve and no users yet.
**Evidence:** 37 Node checks pass: summed counts match the published stamp-folding numbers (OEIS A000136) for 1 to 10 segments, and 387 cases (all unit strips to 7 segments plus 260 random strips with unequal lengths) match an independent Python permutation brute force with 0 mismatches (67 unfoldable, 198 with several foldings). The oracle exposed a real bug in my first engine (22 mismatches), since fixed. 6 of 6 mutations caught. 21 checks in headless Chromium plus a desktop screenshot read. Proof is 3.5, not 4: the oracle and engine share my physical model of what counts as a fold cutting through paper, the published numbers cover only unit lengths, only Chromium was driven, and nobody else has used it.
**Scores:** Ambition 2.5 (search, geometry rules, oracle, curve, page), Craft 3.5, Proof 3.5, Delight 3~ (screenshot only; no animation), Use 2.5 (niche: paper folders and teachers), Originality 3 (stamp folding is known; an interactive checker with unequal lengths and the unfolded curve is a fresh combination). Mean 3.0 (cap 4.0).
**Biggest gap:** nobody has used it, and the fold model is unchecked against real paper or an outside implementation for unequal lengths.

### Fair Rooms: 3.1 (2026-11-18)
**Verdict:** A correct, exact tool for a real everyday question (who pays what for which room), checked well, with no users and an honesty problem it cannot test.
**Evidence:** 22 Node checks pass, including 420 cases (150 with 2 people, 210 with 3, 60 with 4) where the optimum surplus matches an independent Python oracle that tries every assignment and enumerates polyhedron vertices (0 mismatches; 250 optima fractional, 152 negative). 600 random cases up to 6 people are exactly envy-free with exact totals. 6 of 6 mutations caught. 21 checks in headless Chromium plus a desktop screenshot read; two real page faults found by that run (zero-bid default for new people) were fixed. Proof is 3.5, not 4: the oracle shares my objective (maximin surplus among envy-free prices), sizes 5 and 6 have only the property check and not an optimality oracle, only Chromium was driven, and nobody else has used it.
**Scores:** Ambition 3 (exact simplex, assignment theory, rounding, page), Craft 3.5, Proof 3.5, Delight 3~ (screenshot only), Use 3 (real for flatmates, but used once per move and bids can be gamed), Originality 2.5 (the method and similar web tools exist; the inspectable envy table is a modest addition). Mean 3.08, so 3.1 (cap 4.0).
**Biggest gap:** nobody has used it, and bids are only as honest as the people making them.

### Change Ringer: 2.9 (2026-11-19)
**Verdict:** A correct, exact checker and finder for bell-ringing touches, for a small real audience, with no users yet.
**Evidence:** 1387 Node checks pass, including Plain Bob plain courses of 24, 40, 60 and 112 rows (published figures) and plain hunt on 3 to 8 bells. An independent Python oracle agrees on 400 random place notations (53 invalid, all rejected), 600 random touches (12 true, 23 round but false) and four exhaustive searches that try every call string (Minimus 2, Doubles 29, Minor 148 true touches; Doubles has 12 extents): 0 mismatches. 8 of 8 mutants caught. 34 checks in headless Chromium, which read the drawn rows back and check each is a valid row; a desktop screenshot was read. Proof is 3.5, not 4: the oracle shares my reading of place notation, and only the plain-course lengths are outside anchors.
**Scores:** Ambition 2.5 (parser, truth rules, search, page), Craft 3.5, Proof 3.5, Delight 3~ (screenshot only; sound unheard), Use 2 (a niche craft; calls limited to the last change of a lead), Originality 3 (ringing tools exist; this combination in a page is fresh to me). Mean 2.92, so 2.9 (cap 4.0).
**Biggest gap:** no ringer has used it, and methods whose calls change more than the last change of a lead (Grandsire, Stedman) cannot be entered.

### Cut List: 2.9 (2026-11-20)
**Verdict:** A correct, exact cutting planner for a common chore, built on a well-known problem, with no users yet.
**Evidence:** 1230 Node checks pass (parsing, hand-derived plans, kerf edge cases, priced choices). An independent Python subset-DP oracle agrees on 400 random jobs (1 to 13 pieces, 1 to 3 board lengths, 170 priced): 0 mismatches, and exact beat first-fit on 167 of them. 9 of 9 mutants caught (several by only 1 to 6 checks). 24 checks in headless Chromium read the drawn boards back; desktop and phone screenshots were read. Proof is 3.5, not 4: the oracle shares my kerf model, and no one has cut wood from a plan.
**Scores:** Ambition 2.5 (exact DP, parser, drawing), Craft 3.5, Proof 3.5, Delight 3~ (screenshots only), Use 3 (a real, repeatable chore for a wide audience), Originality 2 (cutting stock is a classic problem). Mean 2.92, so 2.9 (cap 4.0).
**Biggest gap:** nobody has used it for a real job; the kerf model and the 3 s search budget on large jobs are untested outside my own examples.

### Sparse Ruler: 2.8 (2026-11-21)
**Verdict:** A correct, exact finder for a charming little problem (fewest marks that measure every length), with a useful "only these lengths" mode, and few real users to imagine.
**Evidence:** 1229 Node checks pass. An independent Python oracle that tries every set of marks agrees on 282 cases (22 complete rulers of length 1 to 22, 260 random target subsets; 186 with several optimal rulers): fewest marks and number of optimal rulers up to mirror, 0 mismatches. The Wichmann family is verified complete for 35 parameter pairs. 10 of 10 mutants caught. 38 checks in headless Chromium read the marks and the map back from the page; desktop, phone and dark screenshots were taken and the desktop and phone ones read. Proof is 3.5, not 4: the oracle shares my definition (both ends are marks, whole numbers only), exact answers are checked only to length 22 (complete) and 20 (subsets), and larger lengths are covered by the property that the returned ruler really measures everything, not by minimality.
**Scores:** Ambition 2 (a known problem, a branch-and-bound plus annealing fallback), Craft 3.5, Proof 3.5, Delight 3~ (screenshots only; click-to-edit was driven by script, not by hand), Use 2 (a puzzle and a rare marking job; the "list your lengths" mode is the practical part), Originality 2.5 (sparse rulers are classic; the subset-of-lengths mode with a live pair map is a modest addition). Mean 2.75, so 2.8 (cap 4.0).
**Biggest gap:** nobody has used it, and minimality is only independently checked up to length 22 (complete) and 20 (subsets).

### Sundial Maker: 3.0 (2026-11-22)
**Verdict:** A correct, printable horizontal sundial generator with a live shadow and an honest watch correction; useful to a small audience who might really build one, and not new as an idea.
**Evidence:** 3493 Node checks pass. An independent Python oracle using different formulas (closed-form hour angle; altitude and azimuth; Meeus solar position; minute-by-minute day length) agrees on 165 hour-line cases, 1,416 live nodus-shadow cases in both hemispheres (to 1e-6), 365 days of declination and equation of time (max 0.44 degrees, 0.79 min) and 117 day lengths (within 1.0 min given the oracle's declination). 10 of 10 engine mutants caught (the weakest by 2 checks), and a mutant engine fails the browser test. 24 checks in headless Chromium, including shadow tip on the hour line and 180 mm width in print media. Desktop and 375 px screenshots were read (a phone overflow was found and fixed). Proof is 3.5, not 4: the oracle shares my sign conventions and the astronomy series is only good to 0.44 degrees; nothing was printed or built.
**Scores:** Ambition 2.5 (several subsystems: astronomy, 3-D projection, printable layout, clock maths), Craft 3.5, Proof 3.5, Delight 3.5~ (shadow moves with a slider and the plate looks like a real dial, judged from screenshots only), Use 2.5 (someone could build a garden sundial from it, but it is a once-per-person job), Originality 2.5 (sundial generators exist; the live shadow plus watch-correction row is a modest combination). Mean 3.0, cap 4.0.
**Biggest gap:** nobody has printed it and built a dial to see whether it tells the time; the printed scale was only checked in emulated print media.
