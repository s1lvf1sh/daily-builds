(function () {
  const O = Overlap, $ = (id) => document.getElementById(id), DAY = O.DAY, MIN = O.MIN;
  const DN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const zones = Intl.supportedValuesOf('timeZone'); if (!zones.includes('UTC')) zones.push('UTC');
  $('zones').innerHTML = zones.map((z) => `<option value="${z}">`).join('');
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const example = () => [
    { name: 'Ana', zone: 'America/New_York', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
    { name: 'Ben', zone: 'Europe/London', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] },
    { name: 'Caio', zone: 'America/Sao_Paulo', start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] }];
  const today = () => { const d = new Date(); return d.toISOString().slice(0, 10); };
  let st = { people: example(), from: today(), weeks: 1, len: 60, view: local };
  try { const h = decodeURIComponent(location.hash.slice(1)); if (h) st = Object.assign(st, JSON.parse(h)); } catch (e) { /* bad link: keep defaults */ }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const validZone = (z) => { try { new Intl.DateTimeFormat('en', { timeZone: z }); return true; } catch (e) { return false; } };
  const validTime = (s) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(s);

  function renderPeople() {
    $('people').innerHTML = st.people.map((p, i) => `<div class="row" data-i="${i}">
      <input data-k="name" value="${esc(p.name)}" aria-label="Name" />
      <input data-k="zone" list="zones" value="${esc(p.zone)}" aria-label="Time zone" />
      <input data-k="start" type="time" value="${esc(p.start)}" aria-label="Starts" />
      <input data-k="end" type="time" value="${esc(p.end)}" aria-label="Ends" />
      <span class="days">${DN.map((n, d) => `<label><input type="checkbox" data-d="${d}" ${p.days.includes(d) ? 'checked' : ''}><span>${n}</span></label>`).join('')}</span>
      <button class="x" data-del="${i}" title="Remove" aria-label="Remove ${esc(p.name)}">×</button></div>`).join('');
  }
  $('people').addEventListener('input', (e) => {
    const row = e.target.closest('.row'); if (!row) return; const p = st.people[+row.dataset.i];
    if (e.target.dataset.k) p[e.target.dataset.k] = e.target.value;
    if (e.target.dataset.d !== undefined) { p.days = [...row.querySelectorAll('[data-d]')].filter((c) => c.checked).map((c) => +c.dataset.d); }
    update();
  });
  $('people').addEventListener('click', (e) => { const i = e.target.dataset.del; if (i !== undefined) { st.people.splice(+i, 1); renderPeople(); update(); } });
  $('add').onclick = () => { st.people.push({ name: 'Person ' + (st.people.length + 1), zone: local, start: '09:00', end: '17:00', days: [1, 2, 3, 4, 5] }); renderPeople(); update(); };
  $('example').onclick = () => { st.people = example(); renderPeople(); update(); };
  for (const id of ['from', 'weeks', 'len', 'view']) $(id).addEventListener('input', () => { st[id] = id === 'from' || id === 'view' ? $(id).value : +$(id).value; update(); });

  const fmtT = (zone, t) => O.localParts(zone, t);
  const hm = (zone, t) => fmtT(zone, t).time;
  const dayName = (zone, t) => { const p = fmtT(zone, t); return DN[p.dow] + ' ' + p.date.slice(5); };
  const short = (z) => z.split('/').pop().replace(/_/g, ' ');

  function update() {
    $('from').value = st.from; $('weeks').value = st.weeks; $('len').value = st.len; $('view').value = st.view;
    try { history.replaceState(null, '', '#' + encodeURIComponent(JSON.stringify(st))); } catch (e) { /* file:// or sandbox */ }
    const errs = [];
    const people = st.people.filter((p, i) => {
      if (!validZone(p.zone)) { errs.push(`"${p.zone}" is not a known time zone (${p.name}).`); return false; }
      if (!validTime(p.start) || !validTime(p.end)) { errs.push(`${p.name}: enter start and end times.`); return false; }
      return true;
    });
    if (!validZone(st.view)) { errs.push(`"${st.view}" is not a known time zone for the view.`); }
    const view = validZone(st.view) ? st.view : local;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(st.from);
    if (!m) { errs.push('Pick a start date.'); }
    $('err').textContent = errs.join(' ');
    if (!m || !people.length) { $('answer').textContent = people.length ? '' : 'Add at least one person.'; $('strips').innerHTML = ''; return; }
    // The period starts at midnight (in the view zone) of the chosen date.
    const from = O.localToInstant(view, Date.UTC(+m[1], +m[2] - 1, +m[3]));
    const ndays = 7 * st.weeks, to = O.localToInstant(view, Date.UTC(+m[1], +m[2] - 1, +m[3] + ndays));
    const common = O.commonWindows(people, from, to).filter(([a, b]) => b - a >= 1 * MIN);
    const names = people.map((p) => p.name || p.zone);
    const localsOf = (a, b) => people.map((p, i) => `<span>${esc(names[i])}: ${hm(p.zone, a)}–${hm(p.zone, b)}${fmtT(p.zone, a).date !== fmtT(view, a).date ? ' (' + dayName(p.zone, a) + ')' : ''}</span>`).join('');
    let html = '';
    if (common.length) {
      const total = common.reduce((s, [a, b]) => s + (b - a), 0) / 3600000;
      html += `<div><b>${common.length}</b> window${common.length === 1 ? '' : 's'} when all ${people.length} are at work, <b>${(+total.toFixed(2))} h</b> in total.</div>`;
      html += common.map(([a, b]) => `<div class="win"><span class="when">${dayName(view, a)} · ${hm(view, a)}–${hm(view, b)}</span><span class="locals">${localsOf(a, b)}</span></div>`).join('');
    } else {
      html += `<div class="none"><b>No time works for everyone.</b></div>`;
    }
    const best = O.bestSlots(people, from, to, st.len, 6);
    if (best.length && !common.length) {
      html += `<div style="margin-top:10px;font-size:14px"><b style="color:var(--fg)">Best ${st.len}-minute compromise: ${best[0].count} of ${people.length} can attend</b></div>`;
      html += best.map((r) => {
        const end = r.lastStart + st.len * MIN; const out = names.filter((_, i) => !r.who[i]);
        return `<div class="win"><span class="when">${dayName(view, r.start)} · ${hm(view, r.start)}${r.lastStart > r.start ? '–' + hm(view, r.lastStart) : ''}</span><span class="locals">${r.lastStart > r.start ? '<span>start any time in this range</span>' : ''}${localsOf(r.start, r.start + st.len * MIN)}${out.length ? `<span class="out">can't: ${esc(out.join(', '))}</span>` : ''}</span></div>`;
      }).join('');
    }
    $('answer').innerHTML = html;
    drawStrips(people, view, from, ndays, common);
  }

  function drawStrips(people, view, from, ndays, common) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(st.from);
    const ivs = people.map((p) => O.workIntervals(p, from - DAY, from + (ndays + 2) * DAY));
    const laneH = Math.max(4, Math.min(8, Math.floor(40 / people.length))), H = people.length * laneH + 12;
    let out = `<div class="axis"><span></span><div>${[0, 6, 12, 18, 24].map((h) => `<span>${h}:00</span>`).join('')}</div></div>`;
    for (let d = 0; d < ndays; d++) {
      const lm = Date.UTC(+m[1], +m[2] - 1, +m[3] + d);
      const a = O.localToInstant(view, lm), b = O.localToInstant(view, lm + DAY);
      const span = b - a, pos = (t) => Math.max(0, Math.min(100, ((t - a) / span) * 100));
      const lane = (list, cls, top, h) => list.filter(([x, y]) => y > a && x < b).map(([x, y]) => `<i class="seg ${cls}" style="left:${pos(x)}%;width:${pos(y) - pos(x)}%;top:${top}px;height:${h}px"></i>`).join('');
      let inner = ivs.map((l, i) => lane(l, '', 2 + i * laneH, laneH - 1)).join('');
      inner += lane(common, 'hit', 2 + people.length * laneH + 1, 8);
      out += `<div class="strip"><span>${dayName(view, a)}</span><div class="track" style="--h:${H}px" title="${dayName(view, a)}">${inner}</div></div>`;
    }
    $('strips').innerHTML = out;
  }

  renderPeople(); update();
})();
