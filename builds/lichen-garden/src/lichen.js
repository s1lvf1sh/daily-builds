// Lichen engine. Pure integer rules, so every run (browser, Node, Python oracle) agrees exactly.
// Day 0 is the world's first day. State on day D = apply spores and step for days 0..D.
export const W = 48, H = 48, N = W * H, MAXAGE = 240;
export const SEEDS = [[12, 12, 1], [35, 14, 2], [24, 36, 3]]; // [x, y, species], each a plus-shaped cluster
export const MAX_SPORES_PER_DAY = 3;

export function mix(a, b, c) {
  let h = Math.imul((a ^ 0x9e3779b9) >>> 0, 0x85ebca6b) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  h = Math.imul((h ^ b) >>> 0, 0xc2b2ae35) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul((h ^ c) >>> 0, 0x27d4eb2f) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
// 0 at midwinter (phase 0 is about 21 December), 180 at midsummer. Years are 360 days.
export const phaseOf = (day) => ((((day - 25) % 360) + 360) % 360);
export const warmth = (day) => 180 - Math.abs(phaseOf(day) - 180);
export const seasonName = (day) => { const w = warmth(day), up = phaseOf(day) < 180; return w < 45 ? 'winter' : w > 135 ? 'summer' : up ? 'spring' : 'autumn'; };

export function newWorld() {
  const w = { sp: new Uint8Array(N), age: new Uint8Array(N), day: -1 };
  for (const [x, y, s] of SEEDS) for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) w.sp[(y + dy) * W + x + dx] = s;
  return w;
}
export function step(w, day, spores = []) {
  const { sp, age } = w;
  let n = 0;
  for (const s of spores) { // spores: [x, y, species]; extras beyond the daily limit are ignored
    if (n++ >= MAX_SPORES_PER_DAY) break;
    const [x, y, k] = s;
    if (x >= 0 && x < W && y >= 0 && y < H && k >= 1 && k <= 3) { sp[y * W + x] = k; age[y * W + x] = 0; }
  }
  const g = 16 + warmth(day), dp = warmth(day) < 30 ? (30 - warmth(day)) >> 3 : 0;
  const nsp = new Uint8Array(N), nage = new Uint8Array(N);
  const cnt = [0, 0, 0, 0];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, cur = sp[i];
    cnt[1] = cnt[2] = cnt[3] = 0; let empty = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) { empty++; continue; }
      const k = sp[yy * W + xx]; if (k) cnt[k]++; else empty++;
    }
    if (cur === 0) {
      const total = cnt[1] + cnt[2] + cnt[3];
      if (total > 0 && (mix(day, i, 1) & 255) < Math.min(255, (g * total) >> 4)) {
        const best = Math.max(cnt[1], cnt[2], cnt[3]), tied = [];
        for (let k = 1; k <= 3; k++) if (cnt[k] === best) tied.push(k);
        nsp[i] = tied[mix(day, i, 2) % tied.length]; nage[i] = 0;
      }
    } else {
      const a = Math.min(255, age[i] + 1);
      const old = a >= MAXAGE && (mix(day, i, 3) & 15) === 0;
      const frost = empty > 0 && dp > 0 && (mix(day, i, 5) & 255) < dp;
      const pred = (cur % 3) + 1;
      if (old || frost) { /* dies */ }
      else if (cnt[pred] >= 3 && (mix(day, i, 4) & 7) === 0) { nsp[i] = pred; nage[i] = 0; }
      else { nsp[i] = cur; nage[i] = a; }
    }
  }
  w.sp = nsp; w.age = nage; w.day = day;
}
// spores: array of {day,x,y,k}. Returns the world after day `to`.
export function simulate(to, spores = [], from = null) {
  let w = from || newWorld();
  const byDay = new Map();
  for (const s of spores) { if (!byDay.has(s.day)) byDay.set(s.day, []); byDay.get(s.day).push([s.x, s.y, s.k]); }
  for (let d = w.day + 1; d <= to; d++) step(w, d, byDay.get(d) || []);
  return w;
}
export const counts = (w) => { const c = [0, 0, 0, 0]; for (const k of w.sp) c[k]++; return c; };
export function digest(w) { // FNV-1a over species and age
  let h = 0x811c9dc5;
  for (let i = 0; i < N; i++) { h = Math.imul(h ^ w.sp[i], 0x01000193) >>> 0; h = Math.imul(h ^ w.age[i], 0x01000193) >>> 0; }
  return h >>> 0;
}
export const dayNumber = (date) => Math.floor(date.getTime() / 86400000); // UTC days
export const encodeSpores = (sp) => sp.map((s) => `${s.day}.${s.x}.${s.y}.${s.k}`).join('~');
export function decodeSpores(t) {
  if (!t) return [];
  return t.split('~').slice(0, 2000).map((p) => p.split('.').map(Number)).filter((a) => a.length === 4 && a.every(Number.isInteger) && a[0] >= 0 && a[0] < 100000).map(([day, x, y, k]) => ({ day, x, y, k }));
}
