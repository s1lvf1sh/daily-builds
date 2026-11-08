# Chladni Sand

Sprinkle sand on a vibrating square plate and watch it crawl to the nodal lines, the places that do not move. Choose one of 25 vibration modes, mix the two degenerate partner modes with a slider, and change shake strength and grain count. Static page, no dependencies, no network.

**Run:** open `index.html` (or the live page). **Test:** `node test/run.js` (needs `python3`) and `NODE_PATH=$(npm root -g) node test/browser.js` (needs Playwright with Chromium).

## Model
An idealised plate: a square membrane with fixed edges. Modes are `sin(mπx)sin(nπy) + s·sin(nπx)sin(mπy)`. Grains hop a random distance proportional to the local |u|, so they keep moving where the plate moves and stall on nodal lines. Real metal plates have free edges and give different figures; frequencies are relative, not Hz. There is no sound.

## How it is checked
- `test/oracle.py` is pure Python and independent: it computes eigenvalues of the finite-difference Laplacian by Sturm bisection (no trig formula, no numpy). `test/run.js` checks that the oracle's lowest 20 eigenvalues match m²+n² including degeneracy (worst error 1.2%, grid discretisation), and that 12 fields from the JS code are eigenvectors of the discrete Laplacian (residuals about 1e-12). A field with a foreign mode mixed in is rejected.
- Symmetry and boundary properties, and sand physics on four modes (mean |u| falls to under 30% of the random value; grains stay on the plate).
- Mutation checks: `MUTATE=field` (wrong mode number) causes 12 failures, `MUTATE=sand` (no shaking) causes 4.
- `test/browser.js` drives the page in headless Chromium (7 checks) and saves screenshots.

Not checked: that the figures resemble real Chladni plates (they should not, boundary conditions differ); the animation as a human sees it; Firefox/Safari; touch use; performance on slow devices.
