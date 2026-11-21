# Sparse Ruler

A ruler does not need a mark at every centimetre. Marks at 0, 1, 4 and 6 are enough to measure every whole length from 1 to 6, because pairs of marks are 1, 2, 3, 4, 5 and 6 apart. This page finds the fewest marks that let you measure every length on a stick of a given length (or only the lengths you list), proves nothing smaller works when it can, and lets you click marks on and off to try to beat it. A live map shows which two marks measure each length, and which lengths are lost.

Live: https://s1lvf1sh.github.io/daily-builds/builds/sparse-ruler/

## Run
Open `index.html` (static, no build, no network). The stick and marks live in the URL hash.

## Test
- `node test/test.js`: 1229 checks (hand-derived distances, Wichmann family, 282 oracle cases, the returned rulers).
- `MUT=bound node test/test.js` (also `nodiff0 noends mirror pal loopend wich lb clean missing`): 10 deliberately broken engines; each must fail.
- `python3 test/oracle.py test/oracle_cases.json`: regenerates the oracle cases in about 1 s.
- `NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js`: headless Chromium, 38 checks.

## How it is checked
- `test/oracle.py` tries every set of marks, smallest size first, with no shared code. For 22 complete rulers (lengths 1 to 22) and 260 random "only these lengths" jobs it gives the fewest marks and the number of optimal rulers up to mirror image. The engine agrees on all 282: 0 mismatches (186 cases have several optimal rulers).
- The minimum counts for lengths 1 to 22 (2,3,3,4,4,4,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,8) match the sequence I remember as OEIS A046693; I did not look it up in this run, so that is a memory check, not a fetched one.
- The Wichmann family (a published construction) is built for r 0..4, s 0..6 and every ruler is checked complete, with the stated length and mark count.

## Known limits
- Exact search is practical to about length 40 (length 38: 0.9 s, 42: 0.5 s, 45: 14 s). Beyond the 4 s budget the page uses simulated annealing and says "not proven fewest". For length 80 it found 17 marks; I did not compare that with the best known value.
- Whole-number lengths only. Both ends count as marks. Targets may be any subset of 1..L.
- The 30 s extra search blocks the page while it runs.
- Only Chromium was driven. Nobody has used it.
