# Knotwork

A Celtic-knot maker. Click the lines between squares to place walls; diagonal strands bounce off walls and weave over and under. The page counts the strands, colours each one, and can search for a wall layout that makes the whole knot a single endless thread. Symmetry modes (mirrors, four-fold turn), SVG download, and a share link in the address bar.

Live: https://s1lvf1sh.github.io/daily-builds/builds/knotwork/

## Run
Open `index.html` (static, no build, no network).

## Test
- `node test/test.js`: 19 checks, about 10 seconds. Needs `python3`.
- `NODE_PATH=$(npm root -g) node test/browser.js [desktop.png] [phone.png]`: 16 checks in headless Chromium.

## How it is checked
- Closed form: an empty a x b grid has exactly gcd(a,b) strands. All 576 sizes up to 24 x 24 agree.
- Independent oracle (`test/oracle.py`): models a strand as a point bouncing diagonally off walls on a half-unit lattice, which shares no layout or code with the engine (that links cell segments). On 1,500 random wall layouts the strand count and every strand length match; over/under alternates round every strand in both implementations.
- The "make one strand" search is confirmed by the oracle on 10 sizes plus a symmetric case.
- Four mutations tried: three were caught at once; the fourth (a wrong rotation) exposed a weak test, which was then strengthened and catches it.

## Known limits
- Nobody else has used it. Only Chromium was driven. Walls cannot be placed with the keyboard. The over/under rule is checked for consistency (alternation), not against any reference weave. The "make one strand" search is a hill-climb: with some symmetries it may report that it found none, which does not prove none exists.
