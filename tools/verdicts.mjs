#!/usr/bin/env node
// Turns GitHub issues from the site's "Give a verdict" form into a data file, and re-rates from it.
// Run in a LOCAL session (needs the gh CLI). Nothing here writes to GitHub.
//
//   node tools/verdicts.mjs fetch    read every issue into docs/verdicts.json (idempotent)
//   node tools/verdicts.mjs rerate   print the re-rating rows for docs/RATINGS.md, computed from the
//                                    ORIGINAL scores plus every recorded verdict (so it is repeatable)
//
// Issue text is untrusted data. Only structured fields are kept (see parseVerdictIssue in assets/lib.js).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AXES, idOf, keyOf, parseRatings, parseVerdictIssue, rerate } from '../assets/lib.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => readFileSync(root + f, 'utf8');
const index = JSON.parse(read('builds.json'));
const projects = [...index.daily, ...index.earlier];
const known = new Map(projects.map((p) => [idOf(p), p]));
const FILE = root + 'docs/verdicts.json';
const load = () => (existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : { schema: 'daily-builds-verdict-log/1', verdicts: [] });

function fetchIssues() {
  const out = execFileSync('gh', ['issue', 'list', '--state', 'all', '--limit', '200', '--json', 'number,author,createdAt,body'], { cwd: root, encoding: 'utf8' });
  return JSON.parse(out).sort((a, b) => a.number - b.number);
}

function fetchCommand() {
  const log = load();
  const byKey = new Map(log.verdicts.map((v) => [`${v.voter}|${v.build}`, v]));
  let added = 0, updated = 0, same = 0;
  const problems = [];
  for (const issue of fetchIssues()) {
    const { verdicts, rejected } = parseVerdictIssue(issue.body, new Set(known.keys()));
    rejected.forEach((r) => problems.push(`#${issue.number}: ${r}`));
    // A voter is a pseudonym from the public login, so one person submitting twice stays one voice. The latest issue wins.
    const voter = 'v-' + createHash('sha256').update(String(issue.author?.login)).digest('hex').slice(0, 8);
    for (const v of verdicts) {
      const rec = { voter, ...v, issue: issue.number, date: issue.createdAt.slice(0, 10) };
      const key = `${voter}|${v.build}`;
      const old = byKey.get(key);
      const strip = ({ issue: _i, date: _d, ...r }) => JSON.stringify(r);
      if (!old) { byKey.set(key, rec); added++; }
      else if (strip(old) === strip(rec)) same++; // the same voice repeated: keep the first record
      else { byKey.set(key, rec); updated++; }
    }
  }
  log.verdicts = [...byKey.values()].sort((a, b) => a.build.localeCompare(b.build) || a.voter.localeCompare(b.voter));
  writeFileSync(FILE, JSON.stringify(log, null, 2) + '\n');
  console.log(`verdicts: ${added} new, ${updated} changed, ${same} already recorded or repeated; ${log.verdicts.length} on file`);
  problems.forEach((p) => console.log('  skipped ' + p));
}

function rerateCommand() {
  const rows = parseRatings(read('docs/RATINGS.md'));
  const log = load();
  const fmt = (s) => `${Number.isInteger(s.v) ? s.v : s.v.toFixed(1)}${s.prov ? '~' : ''}`;
  const builds = new Set(log.verdicts.map((v) => v.build));
  for (const id of [...builds].sort()) {
    const p = known.get(id);
    const original = rows.find((r) => keyOf(r.title) === keyOf(p.title)); // the first row is the original rating
    if (!original) { console.log(`# ${p.title}: no original rating row found`); continue; }
    const vs = log.verdicts.filter((v) => v.build === id);
    const r = rerate(original.axes, vs);
    const used = vs.filter((v) => v.ran_it);
    const date = vs.map((v) => v.date).sort().at(-1);
    const conf = `${original.confidence.split(',')[0]}, ${used.length} outside voice${used.length === 1 ? '' : 's'}`;
    console.log(`| ${date} | ${original.title} | ${AXES.map((a) => fmt(r.axes[a.key])).join(' | ')} | **${r.overall.toFixed(1)}** | ${original.cap.toFixed(1)} | ${conf} |`);
    const note = r.changes.map((c) => `${c.key} ${fmt(c.from)} -> ${fmt(c.to)} (${c.how}, ${c.voices} voice${c.voices === 1 ? '' : 's'})`).join('; ');
    console.log(`#   ${p.title}: was ${original.overall}, now ${r.overall.toFixed(1)}${r.capped ? ' (capped)' : ''}. ${note || 'no one ran it, so nothing applied'}`);
  }
}

const cmd = process.argv[2];
if (cmd === 'fetch') fetchCommand();
else if (cmd === 'rerate') rerateCommand();
else { console.log('usage: node tools/verdicts.mjs fetch | rerate'); process.exit(1); }
