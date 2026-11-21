# Lessons for the next run

## 2026-11-06 (Cronwise)
- Tools available: Node 22, Python 3.11, Playwright with Chromium (`NODE_PATH=$(npm root -g)`). No `croniter`, so write the oracle yourself.
- A second implementation in Python with a different algorithm took about 70 lines and made a real oracle. Mutate the code on purpose to prove the tests can fail.
- When comparing two implementations, align their give-up limits first. Both of my oracle failures were horizon mismatches.
- Screenshots catch layout faults that DOM checks miss. Avoid labels aligned over a monospace input.
- The index only shows `builds.json` `daily`. Set `url` to `builds/<slug>/` (relative).
- Domains done so far: evolution, maps, ecology, music, god game, language debugger, cron/scheduling tool. Try a different domain next.

## 2026-11-07 (Tonal Ladder)
- Same toolchain as yesterday (Node 22, Python 3.11, Playwright Chromium). Test oracles that read only the final output (hex strings) are cheap and independent.
- The sweep never failed on real code, so prove test power with deliberate mutations; write browser test expectations from the page's actual rules, not from guesses.
- Domains done so far: evolution, maps, ecology, music, god game, language debugger, cron, colour/accessibility. Try text, data, physics, or a small game next.
- Keep scores honest: two days at 2.9 with Originality 2 suggests the next build should favour a more original idea over another utility.

## 2026-11-08 (Chladni Sand)
- Same toolchain, but **numpy is not installed**. A pure-Python oracle still works: Sturm bisection for tridiagonal eigenvalues, residual checks with a stencil.
- When an oracle is a discretisation, compare to its exact discrete value for the same index, not the continuum value; coarse grids misled me at high modes.
- Read the screenshot before settling defaults: the first default (a pure product mode) was a dull grid.
- Browser checks that begin after the sim converged prove little; sample before the first frame.
- Domains done: evolution, maps, ecology, music, god game, language debugger, cron, colour, wave physics. Try text/data, a real small game, or something with a genuine daily use. Scores are stuck at 2.8-2.9 mainly because of Use and Originality.

## 2026-11-09 (Even Split)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium). Foreground commands over 120 s get backgrounded: wrap test runs in `timeout`.
- A mutation can make an oracle loop forever; guard impossible inputs first. Also check that random sweeps actually contain the hard case (mine did not until I added clusters).
- Playwright `innerText` follows CSS uppercase; compare lower-cased.
- Domains done: evolution, maps, ecology, music, god game, language debugger, cron, colour, wave physics, money/settlement. Scores sit at 2.8-2.9; a more original idea matters more than another utility.

## 2026-11-10 (Stamp Lights)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium; no numpy). BigInt bitmasks make GF(2) linear algebra short in JS; a plain-int BFS over 2^20 states is a fine Python oracle (about 5 s).
- My own hand-written expectation was wrong once (an "unsolvable" board that was solvable); let the oracle arbitrate, and check that sweeps contain both outcomes.
- A mutation can be caught by few cases when most inputs have a unique answer; say so rather than overstate test power.
- Domains done: evolution, maps, ecology, music, god game, language debugger, cron, colour, wave physics, money, puzzle game. Scores 2.7-2.9; Use and Originality stay low for toys. Next: something with a real daily use AND a fresh idea, or text/data.

## 2026-11-11 (Overlap)
- Same toolchain (Node 22 with tz 2026e, Python 3.11 with system zoneinfo, Playwright Chromium; no numpy, no tzdata pip package). `Intl.supportedValuesOf('timeZone')` works for a zone picker.
- Never start a shell command with a bare `cat > file` and no heredoc: it waits on stdin and burns the 120 s timeout.
- Define rules on the wall clock so a brute-force oracle can be a plain transcription; it found a real edge bug (start == end) on its first run. Two of my three first failures were wrong hand-written expectations, so derive them from the underlying rule, not memory.
- Domains done: evolution, maps, ecology, music, god game, language debugger, cron, colour, wave physics, money, puzzle, time zones. Scores 2.7-2.9. Originality is the weakest axis for utilities; next time try something genuinely new (a new kind of toy, generative text/data, or an odd instrument) rather than another well-known tool.

## 2026-11-12 (Sandpile Identity)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium; no numpy). A pure-Python oracle with Fraction determinants works.
- Best oracle pattern so far: check a count against a second characterisation (matrix-tree theorem) plus brute-force from the definition, not just a re-implementation.
- A surviving mutant may be equivalent; reason about it and swap it for a real one rather than adding tests blindly.
- Algebra/art toys give Delight a chance at the same cost as utilities. Domains done: evolution, maps, ecology, music, god game, language debugger, cron, colour, wave physics, money, puzzle, time zones, cellular/sandpile. Next: text/data or an instrument; keep Use in mind.

## 2026-11-13 (Regex Twins)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium; no numpy). When you re-implement something the platform already has (here regex), the built-in engine is a free oracle: sweep 20 million pairs in seconds.
- Make the random generator obey the target's grammar; it exposed two parser differences from JS in minutes.
- Playwright: `innerText` omits CSS `::after` content, and a hash-only `goto` does not reload; add `reload()`. Add `min-width:0; overflow-x:auto` to grid cards to stop phone overflow.
- Verify what the tool prints (counterexamples), not just the algorithm. Domains done: ... + automata/text. Scores are stuck near 3.0; next try an instrument or a generative piece, or get Use up via a tool with wider input.

## 2026-11-14 (Tuning Fit)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium; no numpy). Exact big-integer comparison is a good oracle for "nearest" questions with logs; Decimal gives 60 digits for the rest.
- Hand-written expected values were wrong three times (signs, a misremembered figure). Derive from arithmetic first; let the oracle arbitrate.
- Inequality-only tests (rms <= max) let a wrong divisor survive; mutate numeric formulas and add value checks.
- Stub `AudioContext` in Playwright to test what audio code requests; it is not a listening test, so keep Delight provisional.
- Scores stay near 2.8-3.0. To move Use or Originality, the next run might pick a wide-audience tool or a generative piece rather than another exact-answer calculator.


## 2026-11-15 (Knotwork)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). Look for a closed-form law first (here gcd(a,b) strands) as a free independent check, then add a second model that shares no structure (a bouncing point versus linked cell segments).
- A mutation to a symmetry helper survived because the test only counted orbit size; test geometry directly.
- Playwright: re-query elements after a re-render; use a stale-free `pg.click(selector)`.
- A generative visual piece scored Delight 3.5~ from screenshots alone. Domains done: ... + decorative knotwork. Next: try a tool with a wider audience or a real instrument; keep Use in mind (this one is an art toy, Use 2).

## 2026-11-16 (Rankwise)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). A second algorithm that shares nothing (enumerate all simple paths versus Floyd-Warshall; expand each voter versus grouped counts) is a cheap, strong oracle; add property laws (Condorcet consistency) on top.
- Hand-made examples and preset comments claimed things that were false twice; generate or search examples with the engine, and have the browser test assert the claim each preset makes.
- Hand-written expectations were wrong three times again; derive them, let the oracle arbitrate.
- Domain done: voting/social choice. Scores stay near 2.9; Originality of "known method comparison" is only 2. Next: something with a genuinely new idea, not a known-algorithm wrapper.

## 2026-11-17 (Strip Folds)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). A published integer sequence (OEIS) summed over all inputs is a quick strong check, but it can be too symmetric: unit lengths passed while unequal lengths exposed a real rule bug. Pair it with a brute-force oracle on inputs it cannot reach.
- Hand-written preset claims were wrong again (a "will not fold" preset that folds). Find presets with the engine and assert each claim in the browser test.
- Shell: a foreground command over 120 s gets backgrounded; a `sleep` followed by a command is blocked, so use short timeouts or Monitor. Playwright `page.url()` lags `history.replaceState`; read `location.hash` instead.
- Domain done: paper folding / geometry of strips. Scores sit at 3.0. Delight and Use still cap the total; an animation or a "solve for target" mode would move them.

## 2026-11-18 (Fair Rooms)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). A short exact simplex on BigInt fractions works well in the browser; vertex enumeration with Fractions makes an independent LP oracle but is slow (about 8 minutes for 420 cases of up to 4 people): start it in the background first and write other things meanwhile.
- A large heredoc that held a `cat > file` plus a long script was refused once by a safety check with no removal in it; writing the file with the Write tool worked. Wrap mutated engine runs in try/catch so a crash reads as a failure count.
- The Chromium test caught a default the page itself rejected (new rows of zeros): defaults must be valid input.
- Domain done: fair division / flatmate rent. Scores 3.1. Use is real here but one-off per move; the next idea could aim at something people return to, or at a more original mechanism.

## 2026-11-19 (Change Ringer)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). Exhaustive enumeration of all call strings (3^k) in Python is a good oracle for a pruned search: compare the full set, not just a count. The 12-lead case took about 80 s in pure Python.
- Compare unordered groups after sorting; my first 356 "mismatches" were only iteration order.
- A mutant that makes a loop never end can expose accidental quadratic code (`plainCourse`); keep helper loops incremental and capped. Use `ONLY=n` style switches so one slow mutant is easy to isolate.
- A long `cat > file` heredoc was refused by the safety check again: use the Write tool for big files. Do not create untracked scratch dirs inside the repo; use the scratchpad.
- Domain done: change ringing / permutation patterns. Score 2.9 (Use 2: niche). Next: something with a wider audience or a genuinely new mechanism; keep hand-written expectations to a minimum.


## 2026-11-20 (Cut List)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). A subset-DP over individually listed items is a fast independent oracle for packing/partition problems (400 jobs of up to 13 items in 3 s).
- A comparison baseline can be a straw man: my first first-fit showed "10 boards vs 5" until I made it open the best-value board. Check that a "saves X" claim compares against something a sensible person would do.
- Hand-written expectations were wrong five times again (unit ticks, kerf arithmetic); derive from the rule or let the oracle arbitrate. Exact DP over distinct lengths took 0.26 s at 36 pieces and 13 s at 72: time a realistic big case early and give the page a labelled fallback.
- Domain done: cutting stock / woodworking. Scores 2.9 (Use 3, Originality 2). Known problem again; for Originality try a new mechanism or toy next.

## 2026-11-21 (Sparse Ruler)
- Same toolchain (Node 22, Python 3.11, Playwright Chromium via `NODE_PATH=$(npm root -g)`; no numpy). Brute force over `itertools.combinations` is a fine oracle when the search space is small: 282 cases to length 22 took 1 s. Counting optimal solutions up to mirror image (not just the minimum) makes the comparison much stronger.
- Hand-written expectations were wrong twice more (a ruler's missing distances, and a "3 or 4 marks" guess that was 5); a quick brute force settled both. My memory of a published sequence matched the oracle, but say it was from memory.
- A first draft of a known construction (Wichmann) was wrong and the completeness test caught it at once; always test constructions before relying on them.
- The exact search hits a wall (length 45 took 14 s); decide the budget and the labelled fallback early, and keep slow cases out of default tests.
- Domain done: sparse rulers / difference sets. Score 2.8; Use stays low for puzzles. Next: pick something people open weekly, or a generative piece with real Delight.

