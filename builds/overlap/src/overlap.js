// Overlap core: working-hour windows in many time zones -> shared windows, exact to the minute.
// Works in Node and in the browser (UMD). Times are integer milliseconds since the Unix epoch,
// always whole minutes. A person is "working" at an instant when their LOCAL wall clock says so:
// the local weekday is allowed and the local time is in [start, end). An end at or before the
// start means the window runs past midnight (22:00-06:00); start == end means the whole local day.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Overlap = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const MIN = 60000, DAY = 86400000, HOUR = 3600000;
  const fmtCache = new Map();

  // UTC offset of a zone at an instant, in minutes (east positive).
  function offsetAt(zone, t) {
    let f = fmtCache.get(zone);
    if (!f) {
      f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
      fmtCache.set(zone, f);
    }
    const p = {};
    for (const x of f.formatToParts(new Date(t))) p[x.type] = +x.value;
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return Math.round((asUtc - Math.floor(t / 1000) * 1000) / MIN);
  }

  // Split [from, to) into pieces with a constant UTC offset: [{start, end, off}].
  function segments(zone, from, to) {
    const out = []; let start = from, off = offsetAt(zone, from);
    for (let t = from + HOUR; ; t += HOUR) {
      const tt = Math.min(t, to); const o = offsetAt(zone, tt);
      if (o !== off && tt > start) {
        let lo = tt - HOUR, hi = tt; // offset(lo) == off, offset(hi) != off; bisect to the minute
        if (lo < start) lo = start;
        while (hi - lo > MIN) { const mid = lo + Math.floor((hi - lo) / MIN / 2) * MIN; if (offsetAt(zone, mid) === off) lo = mid; else hi = mid; }
        out.push({ start, end: hi, off }); start = hi; off = o;
        if (tt === to) { /* the last sliver is handled below */ }
      }
      if (tt >= to) break;
    }
    if (start < to) out.push({ start, end: to, off });
    return out;
  }

  const hm = (s) => { const m = /^(\d{1,2}):(\d{2})$/.exec(s); return (+m[1]) * 60 + (+m[2]); };

  function merge(iv) {
    iv = iv.filter((x) => x[1] > x[0]).sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const x of iv) { const l = out[out.length - 1]; if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else out.push([x[0], x[1]]); }
    return out;
  }

  // Working intervals [[startMs, endMs)] for one person within [from, to).
  // person = { zone, start: "09:00", end: "17:00", days: [1,2,3,4,5] } (0 = Sunday)
  function workIntervals(person, from, to) {
    let s = hm(person.start) * MIN; const e0 = hm(person.end) * MIN;
    let len = ((e0 - s) % DAY + DAY) % DAY;
    if (!len) { s = 0; len = DAY; } // start == end: the whole local calendar day
    const days = new Set(person.days);
    const out = [];
    for (const seg of segments(person.zone, from - DAY, to + DAY)) {
      const lo = seg.start + seg.off * MIN, hi = seg.end + seg.off * MIN; // this piece in local-wall space
      for (let d = Math.floor(lo / DAY) * DAY - DAY; d < hi; d += DAY) {
        if (!days.has(new Date(d).getUTCDay())) continue;
        const a = Math.max(lo, d + s), b = Math.min(hi, d + s + len);
        if (b > a) out.push([a - seg.off * MIN, b - seg.off * MIN]);
      }
    }
    return merge(out).map(([a, b]) => [Math.max(a, from), Math.min(b, to)]).filter((x) => x[1] > x[0]);
  }

  function intersect(A, B) {
    const out = []; let i = 0, j = 0;
    while (i < A.length && j < B.length) {
      const a = Math.max(A[i][0], B[j][0]), b = Math.min(A[i][1], B[j][1]);
      if (b > a) out.push([a, b]);
      if (A[i][1] < B[j][1]) i++; else j++;
    }
    return out;
  }

  // Times when everyone is working.
  function commonWindows(people, from, to) {
    if (!people.length) return [];
    let acc = [[from, to]];
    for (const p of people) acc = intersect(acc, workIntervals(p, from, to));
    return acc;
  }

  // Candidate meeting starts on a 15-minute UTC grid. For each, count the people who are working for
  // the whole meeting. Returns slots sorted by count (desc) then time, plus the per-person verdict.
  function slots(people, from, to, lenMin, step) {
    step = (step || 15) * MIN; const L = lenMin * MIN;
    const iv = people.map((p) => workIntervals(p, from, to));
    const res = [];
    for (let t = Math.ceil(from / step) * step; t + L <= to; t += step) {
      const who = iv.map((list) => list.some(([a, b]) => a <= t && t + L <= b));
      res.push({ start: t, count: who.filter(Boolean).length, who });
    }
    return res;
  }

  function bestSlots(people, from, to, lenMin, limit) {
    const all = slots(people, from, to, lenMin).sort((a, b) => b.count - a.count || a.start - b.start);
    if (!all.length) return [];
    const top = all[0].count;
    // collapse runs of consecutive starts with the same verdict into one range
    const picked = all.filter((x) => x.count === top).sort((a, b) => a.start - b.start);
    const runs = [];
    for (const x of picked) {
      const r = runs[runs.length - 1];
      if (r && x.start - r.lastStart === 15 * MIN && x.who.join() === r.who.join()) r.lastStart = x.start;
      else runs.push({ start: x.start, lastStart: x.start, count: x.count, who: x.who });
    }
    return runs.slice(0, limit || 8);
  }

  // Instant at which a zone's wall clock first reads localMs (given as ms of wall time as if UTC).
  // If that wall time never happens (DST gap) return the instant the gap ends.
  function localToInstant(zone, localMs) {
    for (const seg of segments(zone, localMs - 2 * DAY, localMs + 2 * DAY)) {
      const lo = seg.start + seg.off * MIN, hi = seg.end + seg.off * MIN;
      if (localMs < lo) return seg.start;
      if (localMs < hi) return localMs - seg.off * MIN;
    }
    return localMs;
  }

  function localParts(zone, t) {
    const d = new Date(t + offsetAt(zone, t) * MIN);
    return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16), dow: d.getUTCDay() };
  }

  return { offsetAt, segments, workIntervals, intersect, commonWindows, slots, bestSlots, localToInstant, localParts, MIN, DAY, HOUR };
});
