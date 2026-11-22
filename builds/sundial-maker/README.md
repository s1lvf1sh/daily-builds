# Sundial Maker

Type a latitude and longitude and get a horizontal sundial to print at true size: hour lines, seven curves that show the date (solstices, equinox and the dates between), and a gnomon triangle to cut out. Drag the clock to watch the shadow move; the page says how far the dial reads from your watch today (longitude, daylight saving, equation of time) and gives a month-by-month correction row. Works in both hemispheres (5 to 80 degrees), and can draw the hour lines in standard clock time with the longitude fixed.

Live: https://s1lvf1sh.github.io/daily-builds/builds/sundial-maker/

## Run
Open `index.html` (static, no network). Place and plate size live in the URL hash.

## Test
- `node test/test.js`: 3493 checks (hand-derived anchors, geometry laws, 3,000 + 165 + 365 + 117 independent oracle cases).
- `MUT=name node test/test.js` (hemi east eotsign lon refr decsign nodusz dst gnom dates): 10 deliberately broken engines; each must fail.
- `python3 test/oracle.py`: regenerates `oracle_cases.json` in under 1 s.
- `NODE_PATH=$(npm root -g) SHOT=out.png node test/browser.js`: headless Chromium, 24 checks (also `BASE=url`).

## How it is checked
- Hour lines come from 3-D vectors (sun direction, shadow of the style line); the oracle uses the textbook closed form tan(theta) = sin(lat) tan(H). 165 cases, 11 latitudes both hemispheres, agree to 1e-9.
- Nodus shadows (date curves) come from vector projection; the oracle uses altitude and azimuth then height / tan(altitude). 1,416 live cases at random latitudes (both hemispheres), declinations and hour angles agree to 1e-6.
- Declination and equation of time (Spencer series) against a Meeus-style calculation for every day of 2026: max 0.44 degrees and 0.79 min. Day length against a minute-by-minute oracle: within 5.8 min up to latitude 57; within 1.0 min when the oracle's declination is supplied, so the gap is the series, not the geometry.
- Browser test: the drawn shadow tip lies on the drawn hour line, the nodus dot is where the engine says, noon line flips in the south, the print sheet is 180 mm wide in print media, the gnomon's nodus ring sits on its hypotenuse.

## Known limits
- Horizontal dials only. No vertical or equatorial dial.
- The series is off by up to 0.44 degrees in declination in some weeks (around equinoxes), which moves a date curve by a fraction of a millimetre to a couple of millimetres at default size.
- Day length checked only up to latitude 57; polar cases are checked for day/night kind only.
- Daylight-saving start/end dates are not modelled: you tick the box.
- Not checked: an actual printed page, an actual built sundial, Firefox or Safari. Nobody has used it.
