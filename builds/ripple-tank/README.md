# Ripple Tank

A tank of water you can poke. Tap to drop a stone, draw walls and shallow patches, place a wave maker, and watch waves reflect, bend and interfere. Six scenes (open water, double slit, single slit, lens, shallow shelf, echo box) are one click away; a probe shows one spot's height over time; "Save picture" downloads the tank as a PNG.

Live: https://s1lvf1sh.github.io/daily-builds/builds/ripple-tank/

## Run and test

Open `index.html` through a web server (it uses an ES module), for example `python3 -m http.server`, or use the live link.

```
node --test test/wave.test.mjs                          # engine: 9 tests, about 7 s
NODE_PATH=$(npm root -g) node test/browser.mjs [DIR]    # real Chromium, screenshots into DIR
```

## How it is checked

- **Physics oracles that the scheme does not contain.** Standing-mode periods in a closed box against the continuum wave equation (4 modes, within 1.2%); ring radius against c*t; echo position against the mirror-image source; wavelength in shallow water against c2/c1 (ratio 0.6 within 0.015); double-slit fringe positions and spacing against a direct sum of two point sources and against lambda*L/d; energy conserved to 0.1% over 2000 steps; the sponge edge absorbs; 12 random scenes stay finite and walls stay zero.
- Mutants of the engine (wrong Laplacian weight, walls that leak, shallow water as fast as deep, no sponge, wrong damping sign, wrong source frequency, wrong energy term, flipped stone): 8 of 9 caught. The survivor (a slit one cell wider) is expected: fringe spacing does not depend on slit width, and no test measures the diffraction envelope.
- Real Chromium: the rain runs by itself, a real click stops it and makes a wave, walls drawn by a real drag, shallow, erase, wave maker, probe, pause/play, all six scenes stay finite, a visible band pattern in the real double-slit canvas, deep links, PNG download, keyboard Space, no overflow at 375 px, no console errors.

Not checked: how it feels to a person, other browsers, touch devices, frame rate on slow phones, the lens and shelf scenes against an external focus or refraction-angle formula (only the wavelength law is checked, in a straight strip).
