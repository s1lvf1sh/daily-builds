// Cronwise core: parse, match, next-run search and plain-English description.
// All times are UTC. Standard 5-field cron: minute hour day-of-month month day-of-week.
(function (root) {
  'use strict';
  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const MACROS = {
    '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *'
  };
  const SPECS = [
    { name: 'minute', min: 0, max: 59 },
    { name: 'hour', min: 0, max: 23 },
    { name: 'day of month', min: 1, max: 31 },
    { name: 'month', min: 1, max: 12, names: MONTHS, offset: 1 },
    { name: 'day of week', min: 0, max: 7, names: DAYS, offset: 0 }
  ];

  function num(tok, spec) {
    const up = tok.toUpperCase();
    if (spec.names) {
      const i = spec.names.indexOf(up);
      if (i >= 0) return i + spec.offset;
    }
    if (!/^\d+$/.test(tok)) throw new Error(`"${tok}" is not valid in the ${spec.name} field`);
    const n = parseInt(tok, 10);
    if (n < spec.min || n > spec.max) throw new Error(`${n} is outside ${spec.min}-${spec.max} in the ${spec.name} field`);
    return n;
  }

  function parseField(text, spec) {
    const set = new Set();
    if (text === '') throw new Error(`empty ${spec.name} field`);
    for (const part of text.split(',')) {
      if (part === '') throw new Error(`empty item in the ${spec.name} field`);
      const [range, stepText, extra] = part.split('/');
      if (extra !== undefined) throw new Error(`too many "/" in "${part}"`);
      let step = 1;
      if (stepText !== undefined) {
        if (!/^\d+$/.test(stepText) || parseInt(stepText, 10) < 1) throw new Error(`step "${stepText}" must be a positive number`);
        step = parseInt(stepText, 10);
      }
      let lo, hi;
      if (range === '*' || range === '?') { lo = spec.min; hi = spec.name === 'day of week' ? 6 : spec.max; }
      else if (range.includes('-')) {
        const bits = range.split('-');
        if (bits.length !== 2) throw new Error(`bad range "${range}"`);
        lo = num(bits[0], spec); hi = num(bits[1], spec);
        if (lo > hi) throw new Error(`range ${range} runs backwards in the ${spec.name} field`);
      } else {
        lo = num(range, spec);
        hi = stepText !== undefined ? (spec.name === 'day of week' ? 6 : spec.max) : lo;
      }
      for (let v = lo; v <= hi; v += step) set.add(spec.name === 'day of week' && v === 7 ? 0 : v);
    }
    return set;
  }

  function parse(expr) {
    let src = String(expr).trim().replace(/\s+/g, ' ');
    if (src.startsWith('@')) {
      const m = MACROS[src.toLowerCase()];
      if (!m) throw new Error(`unknown macro ${src}`);
      src = m;
    }
    const parts = src.split(' ');
    if (parts.length !== 5) throw new Error(`expected 5 fields, got ${parts.length}`);
    const sets = parts.map((p, i) => parseField(p, SPECS[i]));
    const star = (p) => p.startsWith('*') || p.startsWith('?');
    return {
      source: src, fields: parts,
      minute: sets[0], hour: sets[1], dom: sets[2], month: sets[3], dow: sets[4],
      domStar: star(parts[2]), dowStar: star(parts[4])
    };
  }

  // Vixie-cron rule: if both day fields are restricted, a day matches when EITHER does.
  function dayMatches(c, y, mo, d) {
    const dow = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    const a = c.dom.has(d), b = c.dow.has(dow);
    if (!c.domStar && !c.dowStar) return a || b;
    return a && b;
  }

  function matches(c, date) {
    return c.minute.has(date.getUTCMinutes()) && c.hour.has(date.getUTCHours()) &&
      c.month.has(date.getUTCMonth() + 1) &&
      dayMatches(c, date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }

  // Fast search: jump a whole month/day/hour at a time instead of minute by minute.
  function next(c, after, limitYears = 8) {
    let t = Date.UTC(after.getUTCFullYear(), after.getUTCMonth(), after.getUTCDate(), after.getUTCHours(), after.getUTCMinutes()) + 60000;
    const end = t + limitYears * 366 * 86400000;
    while (t <= end) {
      const d = new Date(t);
      const y = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, dd = d.getUTCDate(), h = d.getUTCHours(), mi = d.getUTCMinutes();
      if (!c.month.has(mo)) { t = Date.UTC(y, mo, 1); continue; }
      if (!dayMatches(c, y, mo, dd)) { t = Date.UTC(y, mo - 1, dd + 1); continue; }
      if (!c.hour.has(h)) { t = Date.UTC(y, mo - 1, dd, h + 1); continue; }
      if (!c.minute.has(mi)) { t += 60000; continue; }
      return new Date(t);
    }
    return null;
  }

  function nextN(c, after, n) {
    const out = []; let cur = after;
    while (out.length < n) { const x = next(c, cur); if (!x) break; out.push(x); cur = x; }
    return out;
  }

  // ---- English ----
  const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th','st','nd','rd'][n % 10 > 3 ? 0 : n % 10] || 'th');
  const pad = (n) => String(n).padStart(2, '0');

  function list(items) {
    if (items.length <= 1) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  // Collapse sorted ints into runs: [1,2,3,5] -> ["1 through 3","5"] via fmt
  function runs(vals, fmt) {
    const out = []; let i = 0;
    while (i < vals.length) {
      let j = i;
      while (j + 1 < vals.length && vals[j + 1] === vals[j] + 1) j++;
      if (j - i >= 2) out.push(`${fmt(vals[i])} through ${fmt(vals[j])}`);
      else for (let k = i; k <= j; k++) out.push(fmt(vals[k]));
      i = j + 1;
    }
    return out;
  }
  const sorted = (s) => [...s].sort((a, b) => a - b);
  const isAll = (s, spec, top) => s.size === (top - spec.min + 1);

  function describe(c) {
    const [fm, fh, fd, fmo, fw] = c.fields;
    const mins = sorted(c.minute), hrs = sorted(c.hour);
    let time;
    const everyMin = c.minute.size === 60, everyHr = c.hour.size === 24;
    const stepOf = (f) => { const m = /^\*\/(\d+)$/.exec(f); return m ? +m[1] : null; };
    const when = everyHr ? '' : (() => {
      const rr = runs(hrs, (h) => pad(h));
      return ' during ' + list(rr.map((x) => { const m = /^(\d+) through (\d+)$/.exec(x); return m ? `${m[1]}:00 to ${m[2]}:59` : `the ${x}:00 hour`; }));
    })();
    if (everyMin) time = 'Every minute' + when;
    else if (stepOf(fm)) time = `Every ${stepOf(fm)} minutes` + when;
    else if (everyHr && mins.length === 1) time = mins[0] === 0 ? 'Every hour, on the hour' : `Every hour at ${mins[0]} minutes past`;
    else if (mins.length === 1 && stepOf(fh)) time = `At minute ${mins[0]} of every ${stepOf(fh)}th hour`;
    else if (mins.length * hrs.length <= 12) time = 'At ' + list(hrs.flatMap((h) => mins.map((m) => `${pad(h)}:${pad(m)}`)));
    else time = `At minute${mins.length > 1 ? 's' : ''} ${list(mins.map(String))} past hour${hrs.length > 1 ? 's' : ''} ${list(hrs.map(String))}`;

    const parts = [time];
    const domAll = c.dom.size === 31, dowAll = c.dow.size === 7;
    const domTxt = domAll ? null : 'on the ' + list(runs(sorted(c.dom), ord)) + (c.dom.size > 1 ? ' of the month' : ' of the month');
    const dowTxt = dowAll ? null : 'on ' + list(runs(sorted(c.dow).map((d) => (d === 0 ? 7 : d)).sort((a, b) => a - b), (d) => DN[d % 7]));
    if (domTxt && dowTxt && !c.domStar && !c.dowStar) parts.push(`${domTxt}, or ${dowTxt} (when both day fields are set, either one triggers it)`);
    else { if (domTxt) parts.push(domTxt); if (dowTxt) parts.push(dowTxt); }
    if (c.month.size !== 12) parts.push('in ' + list(runs(sorted(c.month), (m) => MN[m - 1])));
    let s = parts.join(', ');
    return s + '.';
  }

  const api = { parse, matches, next, nextN, describe };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Cron = api;
})(typeof self !== 'undefined' ? self : this);
