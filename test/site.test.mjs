// Checks the site's logic against the real data files. Run: node --test test/site.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AXES, fmtDate, fmtShort, parseRatings, parseNotes, mergeBuilds, scoreScale, axisMeans, exportVerdicts, issueUrl, keyOf } from '../assets/lib.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const md = readFileSync(root + 'docs/RATINGS.md', 'utf8');
const index = JSON.parse(readFileSync(root + 'builds.json', 'utf8'));
const rows = parseRatings(md);
const notes = parseNotes(md);
const builds = mergeBuilds(index, rows, notes);

test('every project in builds.json has a parsed rating row and notes', () => {
  assert.equal(rows.length, index.daily.length + index.earlier.length);
  for (const b of builds) {
    assert.ok(b.axes, `${b.title}: no axis scores found in docs/RATINGS.md`);
    assert.ok(b.notes && b.notes.verdict && b.notes.gap, `${b.title}: verdict or biggest gap missing`);
    assert.ok(typeof b.overall === 'number' && !Number.isNaN(b.overall), `${b.title}: no overall`);
  }
});

test('the overall in builds.json matches the table', () => {
  for (const b of builds) {
    const listed = [...index.daily, ...index.earlier].find((p) => keyOf(p.title) === keyOf(b.title)).rating;
    assert.equal(b.overall, listed, `${b.title}: table says ${b.overall}, builds.json says ${listed}`);
  }
});

test('the scale arithmetic holds for every published rating (mean, half rounds up, capped at Proof + 0.5)', () => {
  for (const r of rows) {
    const s = scoreScale(Object.fromEntries(AXES.map((a) => [a.key, r.axes[a.key].v])));
    assert.equal(s.overall, r.overall, `${r.title}: scale gives ${s.overall}, table says ${r.overall}`);
    assert.equal(s.cap, r.cap, `${r.title}: cap ${s.cap} vs ${r.cap}`);
    assert.ok(r.overall <= r.cap, `${r.title}: above its cap`);
  }
});

test('the scale rule: a brilliant but unchecked project is capped by Proof', () => {
  const s = scoreScale({ amb: 5, cra: 5, pro: 1, del: 5, use: 5, ori: 5 });
  assert.deepEqual([s.mean, s.cap, s.overall, s.capped], [4.3, 1.5, 1.5, true]);
  assert.equal(scoreScale({ amb: 2.5, cra: 2.5, pro: 2.5, del: 2.5, use: 2.5, ori: 3 }).mean, 2.6); // 15.5/6 = 2.58
  assert.equal(scoreScale({ amb: 3, cra: 3, pro: 3, del: 3, use: 3, ori: 3.5 }).mean, 3.1); // 18.5/6 = 3.083
});

test('a doctored table is detected (the checks can fail)', () => {
  const bad = md.replace('**2.8** | 4.0', '**3.4** | 4.0'); // inflate one overall
  const badRows = parseRatings(bad);
  const wrong = badRows.filter((r) => scoreScale(Object.fromEntries(AXES.map((a) => [a.key, r.axes[a.key].v]))).overall !== r.overall);
  assert.ok(wrong.length >= 1, 'an inflated score was not noticed');
});

test('titles with apostrophes still match across files', () => {
  assert.equal(keyOf("Let's Play God"), keyOf('Lets Play God'));
  assert.equal(keyOf('[[Tonal Ladder]]'), 'tonal ladder');
});

test('provisional marks are read', () => {
  const r = rows.find((x) => x.title === 'Cronwise');
  assert.equal(r.axes.del.prov, true);
  assert.equal(r.axes.pro.prov, false);
  assert.equal(r.axes.del.v, 3);
});

test('axis means show the weakest axis, from the data', () => {
  const m = axisMeans(builds);
  assert.equal(m.length, 6);
  const weakest = [...m].sort((a, b) => a.mean - b.mean)[0];
  assert.ok(['Use', 'Originality', 'Ambition'].includes(weakest.name), weakest.name);
  const del = m.find((a) => a.key === 'del');
  assert.ok(del.provisional >= 1 && del.n === builds.length);
});

test('dates are written day-month', () => {
  assert.equal(fmtDate('2026-11-06'), '6 Nov 2026');
  assert.equal(fmtDate('2026-01-31'), '31 Jan 2026');
  assert.equal(fmtShort('2026-11-21'), '21 Nov');
  assert.equal(fmtDate(''), '');
});

test('exported verdicts are valid JSON and carry only what was filled in', () => {
  const out = JSON.parse(exportVerdicts({ cronwise: { use: 4, del: 3.5, ran: true, back: false, note: 'handy' }, 'tonal-ladder': { ran: false } }, '2026-11-21'));
  assert.equal(out.schema, 'daily-builds-verdicts/1');
  assert.deepEqual(out.verdicts[0], { build: 'cronwise', use: 4, delight: 3.5, ran_it: true, would_return: false, note: 'handy' });
  assert.deepEqual(out.verdicts[1], { build: 'tonal-ladder', ran_it: false, would_return: false });
});

test('notes are capped at 400 characters and the issue link refuses to be too long', () => {
  const long = exportVerdicts({ a: { note: 'x'.repeat(5000) } }, '2026-11-21');
  assert.ok(JSON.parse(long).verdicts[0].note.length === 400);
  const many = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`b${i}`, { use: 3, del: 3, note: 'y'.repeat(200) }]));
  assert.equal(issueUrl(exportVerdicts(many, '2026-11-21'), 40), null);
  const u = issueUrl(exportVerdicts({ cronwise: { use: 4 } }, '2026-11-21'), 1);
  assert.ok(u.startsWith('https://github.com/s1lvf1sh/daily-builds/issues/new?'));
  assert.ok(new URL(u).searchParams.get('body').includes('"build": "cronwise"'));
});
