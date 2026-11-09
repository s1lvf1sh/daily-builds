// Even Split core: parse expense lines, split in whole cents, settle with the fewest transfers.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.EvenSplit = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const toCents = (s) => {
    const m = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(s);
    if (!m) return null;
    return parseInt(m[1], 10) * 100 + (m[2] ? parseInt((m[2] + '0').slice(0, 2), 10) : 0);
  };
  const fmt = (c) => (c < 0 ? '-' : '') + Math.floor(Math.abs(c) / 100) + '.' + String(Math.abs(c) % 100).padStart(2, '0');

  // Split `total` cents by integer weights. Shares always sum to total exactly
  // (largest-remainder method; ties go to the earlier person).
  function allocate(total, weights) {
    const W = weights.reduce((a, b) => a + b, 0);
    const shares = [], rems = [];
    let used = 0;
    weights.forEach((w, i) => {
      const prod = total * w, r = prod % W;
      const q = (prod - r) / W;
      shares.push(q); rems.push([r, i]); used += q;
    });
    rems.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (let k = 0; k < total - used; k++) shares[rems[k][1]]++;
    return shares;
  }

  function parse(text) {
    const people = []; const seen = new Set();
    const addP = (n) => { const k = n.toLowerCase(); if (!seen.has(k)) { seen.add(k); people.push(k); } return k; };
    const events = [], errors = [];
    text.split(/\r?\n/).forEach((raw, idx) => {
      const line = raw.replace(/#.*$/, '').trim();
      if (!line) return;
      const err = (m) => errors.push({ line: idx + 1, text: raw.trim(), message: m });
      let m = /^(\S+)\s+sent\s+(\S+)\s+(\S+)$/i.exec(line);
      if (m) {
        const c = toCents(m[3]);
        if (c === null || c <= 0) return err('amount must be a positive number like 12 or 12.50');
        if (m[1].toLowerCase() === m[2].toLowerCase()) return err('a person cannot send money to themselves');
        events.push({ kind: 'transfer', from: m[1].toLowerCase(), to: m[2].toLowerCase(), cents: c, line: idx + 1 });
        return;
      }
      m = /^(\S+)\s+paid\s+(\S+)\s*(.*)$/i.exec(line);
      if (!m) return err('expected "name paid 12.50 label for a, b" or "name sent other 10"');
      const c = toCents(m[2]);
      if (c === null || c <= 0) return err('amount must be a positive number like 12 or 12.50');
      let rest = m[3], listText = 'all';
      const fm = /(?:^|\s)for\s+(.*)$/i.exec(rest);
      if (fm) { listText = fm[1]; rest = rest.slice(0, fm.index); }
      events.push({ kind: 'expense', payer: m[1].toLowerCase(), cents: c, label: rest.trim(), listText: listText.trim(), line: idx + 1 });
    });
    // second pass: register people in order of appearance, resolve lists
    const expenses = [], transfers = [];
    for (const ev of events) {
      const err = (msg) => errors.push({ line: ev.line, text: text.split(/\r?\n/)[ev.line - 1].trim(), message: msg });
      if (ev.kind === 'transfer') { addP(ev.from); addP(ev.to); transfers.push(ev); continue; }
      addP(ev.payer);
      let lt = ev.listText, except = false;
      const em = /^(?:all|everyone)\s+except\s+(.*)$/i.exec(lt);
      let entries = [];
      if (em) { except = true; lt = em[1]; }
      else if (/^(all|everyone)$/i.test(lt)) lt = null;
      if (lt !== null) {
        for (const tok of lt.split(/\s*,\s*|\s+and\s+/i)) {
          if (!tok) continue;
          const tm = /^(\S+?)(?::(\d+(?:\.\d{1,2})?))?$/.exec(tok.trim());
          if (!tm) { err('could not read "' + tok + '"'); entries = null; break; }
          const w = tm[2] === undefined ? 100 : Math.round(parseFloat(tm[2]) * 100);
          if (w <= 0) { err('a share weight must be above zero'); entries = null; break; }
          entries.push([addP(tm[1]), w]);
        }
        if (entries === null) continue;
        if (!entries.length) { err('nobody to split between'); continue; }
      }
      expenses.push({ payer: ev.payer, cents: ev.cents, label: ev.label, entries: lt === null ? 'all' : entries, except, line: ev.line });
    }
    const out = [];
    for (const e of expenses) {
      let list;
      if (e.entries === 'all') list = people.map((p) => [p, 100]);
      else if (e.except) {
        const ex = new Set(e.entries.map((x) => x[0]));
        list = people.filter((p) => !ex.has(p)).map((p) => [p, 100]);
        if (!list.length) { errors.push({ line: e.line, text: text.split(/\r?\n/)[e.line - 1].trim(), message: 'nobody left to split between' }); continue; }
      } else {
        const merged = new Map();
        for (const [p, w] of e.entries) merged.set(p, (merged.get(p) || 0) + w);
        list = [...merged.entries()];
      }
      out.push({ payer: e.payer, cents: e.cents, label: e.label, list, line: e.line });
    }
    return { people, expenses: out, transfers, errors };
  }

  // Everyone's net position in cents: positive = is owed money.
  function balances(parsed) {
    const bal = {}; parsed.people.forEach((p) => (bal[p] = 0));
    const owed = {}; parsed.people.forEach((p) => (owed[p] = 0));
    const paid = {}; parsed.people.forEach((p) => (paid[p] = 0));
    for (const e of parsed.expenses) {
      // people list is final, so "all" is resolved against everyone seen anywhere
      const shares = allocate(e.cents, e.list.map((x) => x[1]));
      bal[e.payer] += e.cents; paid[e.payer] += e.cents;
      e.list.forEach(([p], i) => { bal[p] -= shares[i]; owed[p] += shares[i]; });
      e.shares = shares;
    }
    for (const t of parsed.transfers) { bal[t.from] += t.cents; bal[t.to] -= t.cents; }
    return { bal, owed, paid };
  }

  // Greedy settle of one group whose balances sum to zero: n-1 transfers at most.
  function greedy(idx, bal) {
    const cr = idx.filter((i) => bal[i] > 0).map((i) => [i, bal[i]]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    const db = idx.filter((i) => bal[i] < 0).map((i) => [i, -bal[i]]).sort((a, b) => b[1] - a[1] || a[0] - b[0]);
    const out = [];
    let ci = 0, di = 0;
    while (ci < cr.length && di < db.length) {
      const a = Math.min(cr[ci][1], db[di][1]);
      out.push({ from: db[di][0], to: cr[ci][0], cents: a });
      cr[ci][1] -= a; db[di][1] -= a;
      if (cr[ci][1] === 0) ci++;
      if (db[di][1] === 0) di++;
    }
    return out;
  }

  const MAX_EXACT = 18;
  // Fewest transfers = (non-zero people) - (max number of disjoint zero-sum groups).
  function settle(balMap, people) {
    const idx = people.map((_, i) => i).filter((i) => balMap[people[i]] !== 0);
    const b = people.map((p) => balMap[p]);
    const n = idx.length;
    let groups;
    let exact = true;
    if (n === 0) groups = [];
    else if (n > MAX_EXACT) { groups = [idx]; exact = false; }
    else {
      const full = (1 << n) - 1;
      const sum = new Int32Array(1 << n);
      const best = new Int8Array(1 << n); // max zero-sum groups in this subset
      const pick = new Int32Array(1 << n);
      for (let s = 1; s <= full; s++) {
        const low = s & -s, bit = 31 - Math.clz32(low);
        sum[s] = sum[s ^ low] + b[idx[bit]];
      }
      for (let s = 1; s <= full; s++) {
        const low = s & -s;
        let bv = 0, bp = 0;
        // groups containing the lowest set bit
        for (let sub = s; sub > 0; sub = (sub - 1) & s) {
          if (!(sub & low) || sum[sub] !== 0) continue;
          const v = 1 + best[s ^ sub];
          if (v > bv) { bv = v; bp = sub; }
        }
        // if no zero-sum group contains `low`, `low` joins another group later: treat remainder as one blob
        best[s] = bv; pick[s] = bp;
      }
      groups = []; let s = full;
      while (s) {
        const sub = pick[s];
        if (!sub) { groups.push(bitsOf(s)); break; }
        groups.push(bitsOf(sub)); s ^= sub;
      }
      function bitsOf(m) { const r = []; for (let k = 0; k < n; k++) if (m & (1 << k)) r.push(idx[k]); return r; }
    }
    const transfers = [];
    for (const g of groups) for (const t of greedy(g, b)) transfers.push({ from: people[t.from], to: people[t.to], cents: t.cents, group: groups.indexOf(g) });
    return { transfers, groups: groups.map((g) => g.map((i) => people[i])), exact };
  }

  function run(text) {
    const parsed = parse(text);
    const { bal, owed, paid } = balances(parsed);
    const s = settle(bal, parsed.people);
    return { ...parsed, bal, owed, paid, ...s };
  }

  return { parse, allocate, balances, settle, run, fmt, toCents, MAX_EXACT };
});
