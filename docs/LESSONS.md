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
