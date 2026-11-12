# Sandpile Identity

An abelian sandpile on a grid with an absorbing edge. The page draws the grid's **identity pile**, the one configuration that leaves any recurrent pile unchanged when added to it, and lets you check that claim live: drop grains by hand, add the identity to a random pile and watch nothing change, add it to a non-recurrent pile and watch it change. Grids from 1x1 to 101x101, square or rectangular.

Live: https://s1lvf1sh.github.io/daily-builds/builds/sandpile-identity/

## Run
Open `index.html` (static, no build, no network).

## Test
- `node test/test.js`: 134 checks, about 9 s. Needs `python3`.
- `NODE_PATH=$(npm root -g) node test/browser.js [wide.png] [phone.png]`: 17 checks in headless Chromium.

## How it is checked
- `src/sandpile.js` topples in bulk (floor(v/4) at once, stack order). `test/oracle.py` shares no code: it topples one cell at a time in row-major order.
- Identity from the formula e = s(2c - s(2c)) is compared cell for cell with the oracle on 11 grid sizes up to 25x13.
- On 1x1, 2x2, 1x3, 2x3 and 3x3 grids the oracle finds the recurrent set by brute-force closure (everything reachable from all-3 by adding grains) and finds the identity by definition (the one pile with e + r = r for every recurrent r). The recurrent counts (4, 192, 56, 2415, 100352) equal the determinant of the grid Laplacian, which is the matrix-tree theorem and an independent number. The JS burning test accepts exactly that many of the 4^n piles for n <= 9.
- Further properties: e + e = e and e + a = a for 6 random recurrent piles on each of 4 grid sizes up to 61x61; abelian property (bulk stack order = parallel rounds) on 20 random piles; mirror symmetry; grains lost = sink-edge topples; non-recurrent piles rejected.
- Mutations caught: a leaky edge (64 fail), wrong start for the identity (45 fail), burning test missing sink edges (32 fail), recurrence test with a shortcut (3 fail). One mutation (accept toppled >= 1 instead of == 1) survived: it is equivalent, because a stable pile cannot topple a cell twice in burning.

## Known limits
- The identity is verified against the oracle only up to 25x13, and by algebraic properties up to 61x61. 101x101 is checked in the page by e + e = e and recurrence, not by an oracle.
- Only Chromium was driven. Nobody else has used it.
- Piles are shown, not explained cell by cell.
