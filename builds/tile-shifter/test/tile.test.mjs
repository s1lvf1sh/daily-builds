// Run: node --test builds/tile-shifter/test/tile.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../src/tile.js';

// Independent oracle: winding number (not the crossing-parity test the engine uses).
function winding(poly, x, y) {
  let w = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    const cr = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
    if (y1 <= y) { if (y2 > y && cr > 0) w++; } else if (y2 <= y && cr < 0) w--;
  }
  return w;
}
const lcg = (s) => () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);

// How many lattice copies cover (x,y), by winding number. Exactly one means a perfect tiling there.
function cover(tile, x, y) {
  let c = 0;
  const [a, b] = tile.lattice;
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) if (winding(tile.outline, x - i * a[0] - j * b[0], y - i * a[1] - j * b[1]) !== 0) c++;
  return c;
}

const cases = [];
for (const kind of ['para', 'hex']) for (const k of [1, 2, 3, 4]) for (let seed = 1; seed <= 8; seed++) {
  const r = lcg(seed * 31 + k);
  cases.push({ kind, k, seed, skew: (r() - 0.5) * 0.8, height: 0.7 + r() * 0.6 });
}

test('every shuffled tile is legal and tiles the plane: each sampled point is covered exactly once', () => {
  let tiles = 0, points = 0, bad = 0;
  for (const c of cases) {
    const { state } = T.shuffle(c.seed * 1000, c.kind, c.k, 0.3, c.skew, c.height);
    const tile = T.buildTile(state);
    const v = T.validate(tile);
    assert.ok(v.ok, `${c.kind} k=${c.k} seed=${c.seed}: ${JSON.stringify(v)}`);
    const r = lcg(c.seed + 99);
    for (let n = 0; n < 150; n++) {
      const x = (r() - 0.2) * 3, y = (r() - 0.2) * 3;
      points++;
      if (cover(tile, x, y) !== 1) bad++;
    }
    tiles++;
  }
  console.log(`  ${tiles} tiles, ${points} sample points, ${bad} not covered exactly once`);
  assert.equal(bad, 0);
});

test('area of the outline equals one lattice cell (shoelace vs lattice determinant) for every tile', () => {
  for (const c of cases) {
    const { state } = T.shuffle(c.seed * 1000, c.kind, c.k, 0.3, c.skew, c.height);
    const tile = T.buildTile(state);
    assert.ok(Math.abs(Math.abs(T.shoelace(tile.outline)) - T.cellArea(tile.lattice)) < 1e-9);
  }
});

test('Monte Carlo agrees with the shoelace area', () => {
  const { state } = T.shuffle(5, 'hex', 3, 0.3, 0.1, 1);
  const tile = T.buildTile(state);
  const xs = tile.outline.map((p) => p[0]), ys = tile.outline.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const r = lcg(7); let hit = 0; const N = 200000;
  for (let n = 0; n < N; n++) if (winding(tile.outline, x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)) !== 0) hit++;
  const est = (hit / N) * (x1 - x0) * (y1 - y0);
  const area = Math.abs(T.shoelace(tile.outline));
  assert.ok(Math.abs(est - area) / area < 0.01, `MC ${est} vs ${area}`);
});

test('seams: each side equals its partner translated by the lattice step, traversed backwards', () => {
  for (const kind of ['para', 'hex']) {
    const { state } = T.shuffle(11, kind, 3, 0.3, 0.2, 1.1);
    const t = T.buildTile(state);
    const p = t.pairs;
    for (let i = 0; i < p; i++) {
      const A = t.sides[i], B = t.sides[i + p];
      const dx = B[B.length - 1][0] - A[0][0], dy = B[B.length - 1][1] - A[0][1];
      A.forEach((q, k) => {
        const m = B[B.length - 1 - k];
        assert.ok(Math.abs(q[0] + dx - m[0]) < 1e-12 && Math.abs(q[1] + dy - m[1]) < 1e-12);
      });
      // and the neighbouring copy shifted by a lattice vector shares the seam exactly
      const [a, b] = t.lattice;
      const shifts = [a, b, [a[0] - b[0], a[1] - b[1]], [a[0] + b[0], a[1] + b[1]]];
      const hit = shifts.some((s) => Math.abs(dx - s[0]) < 1e-9 && Math.abs(dy - s[1]) < 1e-9 || Math.abs(dx + s[0]) < 1e-9 && Math.abs(dy + s[1]) < 1e-9);
      assert.ok(hit, `${kind} side ${i}: seam shift (${dx},${dy}) is not a lattice vector`);
    }
  }
});

test('a self-crossing outline is rejected', () => {
  const s = { kind: 'para', skew: 0, height: 1, edges: [[[0.9, 0.4], [0.1, 0.4]], [[0.5, 0]]] };
  const v = T.validate(T.buildTile(s));
  assert.equal(v.simple, false);
  assert.equal(v.ok, false);
});

test('the untouched tile is exactly the plain parallelogram / hexagon', () => {
  const p = T.buildTile({ kind: 'para', skew: 0.25, height: 1, edges: [[], []] });
  assert.ok(Math.abs(Math.abs(T.shoelace(p.outline)) - 1) < 1e-12);
  const h = T.buildTile({ kind: 'hex', skew: 0, height: 1, edges: [[], [], []] });
  assert.ok(Math.abs(Math.abs(T.shoelace(h.outline)) - 1.5 * Math.sqrt(3)) < 1e-9); // regular hexagon, side 1
});

test('encode/decode round trips and rejects junk', () => {
  for (const c of cases.slice(0, 24)) {
    const { state } = T.shuffle(c.seed * 77, c.kind, c.k, 0.3, c.skew, c.height);
    const back = T.decodeState(T.encodeState(state));
    assert.ok(back && back.kind === state.kind);
    const a = T.buildTile(back), b = T.buildTile(state);
    assert.ok(Math.abs(Math.abs(T.shoelace(a.outline)) - Math.abs(T.shoelace(b.outline))) < 0.02);
  }
  for (const bad of ['', 'x', 'h|0|1|1,1', 'p|0|1|0.5,0.5;a,b|', 'p|0|9|0,0|0,0', 'p|0|1|9,9|0,0', '<script>']) assert.equal(T.decodeState(bad), null, bad);
});

test('shuffle is deterministic per seed', () => {
  assert.deepEqual(T.shuffle(42, 'hex', 3, 0.3, 0, 1).state, T.shuffle(42, 'hex', 3, 0.3, 0, 1).state);
  assert.notDeepEqual(T.shuffle(42, 'hex', 3, 0.3, 0, 1).state, T.shuffle(43, 'hex', 3, 0.3, 0, 1).state);
});

test('translatesFor covers the whole view box (no gaps at the corners)', () => {
  const t = T.buildTile(T.shuffle(3, 'hex', 3, 0.3, 0.2, 1).state);
  const box = [-2, -1, 3, 4];
  const tr = T.translatesFor(t, box, 1);
  const r = lcg(5);
  for (let n = 0; n < 300; n++) {
    const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]);
    assert.ok(tr.some((q) => winding(t.outline, x - q.x, y - q.y) !== 0), `hole at ${x},${y}`);
  }
});

test('colouring: lattice neighbours always differ with 3 or more colours', () => {
  for (let n = 3; n <= 5; n++) for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    for (const [di, dj] of [[1, 0], [0, 1], [1, -1], [1, 1], [-1, 1]]) {
      if (n === 3 && di === 1 && dj === 1) continue; // only the six hex neighbours matter: (1,0),(0,1),(1,-1) and negatives
      if (n >= 3 && (di === 1 && dj === 0 || di === 0 && dj === 1 || di === 1 && dj === -1)) assert.notEqual(T.colourIndex(i, j, n), T.colourIndex(i + di, j + dj, n));
    }
  }
});

test('svg exports are well formed', () => {
  const t = T.buildTile(T.shuffle(9, 'hex', 3, 0.3, 0, 1).state);
  const s = T.tileSVG(t);
  assert.match(s, /^<svg [^>]*viewBox="[-\d. ]+"/);
  assert.ok(!/NaN|undefined/.test(s));
  const sheet = T.toSVG(t, { palette: ['#e63946', '#f1c453', '#2a9d8f'] });
  assert.ok(!/NaN|undefined/.test(sheet));
  assert.ok((sheet.match(/<use /g) || []).length > 5);
});
