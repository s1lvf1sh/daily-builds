# Tile Shifter

Drag a dot on a tile and its twin edge moves with it, so the shape still tiles the plane with no gaps, the trick behind Escher-style tessellations. Pick a hexagon or a parallelogram, shuffle for a random creature-like tile, drag dots, let it "breathe", then download the tile or a tiled sheet as SVG, or copy a link that holds your exact tile.

Live: https://s1lvf1sh.github.io/daily-builds/builds/tile-shifter/

## Run and test

Open `index.html` (it uses an ES module, so serve the folder, for example `python3 -m http.server`, or use the live link). Tests:

```
node --test test/tile.test.mjs                          # engine: 11 tests, 9,600 sampled points
NODE_PATH=$(npm root -g) node test/browser.mjs [DIR]    # real Chromium, screenshots into DIR
```

## How it is checked

- **Independent coverage oracle.** For 64 random tiles (both shapes, 1 to 4 dots per edge, random skew and height), 150 random points each are counted against every lattice copy using a *winding-number* test, while the engine uses a crossing-parity test. Every point must be covered exactly once: 9,600 points, 0 failures.
- Area by shoelace equals the lattice cell (determinant); Monte Carlo (200,000 points) agrees to 1%.
- Seams: each side equals its partner, translated by a lattice vector and reversed, point for point.
- A self-crossing outline is rejected; the share-link decoder rejects junk.
- Mutants of the engine (partner not reversed, mirrored, wrong offset, wrong hex lattice, no self-crossing check, ...): 10 caught, 1 survived (the area check, which is redundant by construction; see the journal).
- Real Chromium: 12 shuffled tilings painted with no transparent pixel, a real mouse drag, a wild drag, share-link round trip, "Breathe" for 1.25 s with no gaps, a bad link, no overflow at 375 px, no console errors.

Not checked: how it feels to a person, other browsers, touch devices, printing or cutting the SVG, Safari's handling of ES modules from file.
