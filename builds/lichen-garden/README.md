# Lichen Garden

A 48 by 48 patch of stone with three lichens (sage, ochre, slate). They spread to empty neighbours, faster in summer; winter frost eats the exposed edges; sage beats ochre, ochre beats slate, slate beats sage when three neighbours push. The calendar is shared and fixed: day 0 is 26 Nov 2026 (UTC) and every die roll is a hash of (day, cell), so the same date gives the same garden for everyone. You plant up to three spores a day (kept in your browser, shareable as a link), drag the slider to see the past or a forecast with your spores, or press Play.

Live: https://s1lvf1sh.github.io/daily-builds/builds/lichen-garden/

## Run and test

Serve the folder (it uses an ES module), for example `python3 -m http.server`, or use the live link. `?today=N&still=1` pins the day and stops autoplay (used by the tests).

```
node --test test/lichen.test.mjs                        # 9 tests, about 8 s (calls python3 for the oracle)
NODE_PATH=$(npm root -g) node test/browser.mjs [DIR]    # real Chromium, screenshots into DIR
```

## The rules (the spec the oracle was written from)

Per day: (1) apply up to 3 spores (cell becomes that species, age 0); (2) update all cells at once. warmth = 180 - |phase - 180|, phase = (day - 25) mod 360. Empty cell with n occupied neighbours (8-neighbourhood): becomes the majority neighbour species (ties by hash) when `hash(day,cell,1) & 255 < min(255, (16 + warmth) * n / 16)`. Occupied cell: dies if age reaches 240 (1 in 16 per day); dies from frost when warmth < 30, it has an empty or off-grid neighbour and `hash(day,cell,5) & 255 < (30 - warmth) / 8`; otherwise is replaced by its predator species (species mod 3 + 1) if 3 or more neighbours are that species, with chance 1 in 8; otherwise ages.

## How it is checked

- An independent Python re-implementation (`test/oracle.py`, dict based, no shared code) matches the engine on 14 random worlds with random spore logs, by a digest of every cell. It was written by the same author from the same rules, so it catches implementation slips, not a misreading of the spec.
- Fast-forward equals replay, growth needs a parent, spore limit, codec round trip, two-year survival, hash uniformity.
- 10 hand-made mutants of the engine, all caught (mostly by the oracle).
- Real Chromium: page state equals engine digest, canvas pixel counts equal engine species counts, real clicks, persistence, share link, scrubbing, autoplay, 375 px.

Not checked: how it feels to a person, whether it stays interesting after the first minute, other browsers, touch devices, behaviour across a real date rollover (tested with `?today=`), long-term grid saturation tuning, a clock in a non-UTC time zone.
