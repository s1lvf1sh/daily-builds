# Harmonograph

Four damped pendulums (two steer the pen left–right, two up–down) draw a curve that slowly collapses to the centre, like the Victorian drawing machine. It starts drawing on its own; **Surprise me** makes a new one, dragging on the paper re-pitches the main pair, and each design has a share link and an SVG export. A read-out names the interval between the main pair ("3:2 (fifth), 3.5 cents flat") and says whether the shape closes or slowly turns.

Live: https://s1lvf1sh.github.io/daily-builds/builds/harmonograph/

## Run and test

Open `index.html` (no server, no build). Tests:

```
node test/test.js                                   # engine, 86 checks
NODE_PATH=$(npm root -g) node test/browser.js DIR   # real Chromium, 25 checks, screenshots into DIR
MUTATE=decay node test/test.js                      # broken engine: must fail (decay phase axis cents svgflip clampf)
```

## How it is checked

- Each pendulum's closed form `a·sin(2πft+φ)·e^(−dt)` is compared with an independent RK4 integration of the damped-oscillator ODE (60 random pendulums, worst error 8e-8).
- Closed Lissajous curves are counted for self-intersections by brute force and compared with the known `2ab − a − b`. The formula was reached for all 9 ratios at some phase; at 9 of 72 phase counts the polyline count was one lower, which I did not explain (see the journal).
- Share-link round trip, interval/cents maths, SVG output, bounds over 200 random designs, 6 of 6 deliberate engine mutants caught.
- Real Chromium: drawing grows, pause freezes, presets read out the engine's own interval, drag changes pitch, shared link restores a design, bad link falls back, the downloaded SVG equals the engine output, no overflow at 375 px, no console errors.

Not checked: how it feels to a person, other browsers, touch devices, performance on slow phones, any sound (there is none).
