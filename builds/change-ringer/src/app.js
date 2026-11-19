(function () {
  const $ = (id) => document.getElementById(id);
  const PRESETS = [
    { name: 'Plain Bob Minimus', n: 4, pn: '&x14x14,12', bob: '14', single: '1234', comp: 'ppp' },
    { name: 'Plain Bob Doubles', n: 5, pn: '&5.1.5.1.5,125', bob: '145', single: '123', comp: 'pppbpppbpppb' },
    { name: 'Plain Bob Minor', n: 6, pn: '&x16x16x16,12', bob: '14', single: '1234', comp: 'ppppp' },
    { name: 'Plain Bob Major', n: 8, pn: '&x18x18x18x18,12', bob: '14', single: '1234', comp: 'pppppp' },
    { name: 'Plain Hunt Minor', n: 6, pn: 'x16x16x16x16x16x16', bob: '', single: '', comp: 'p' },
  ];
  const MAX_ROWS = 1500;
  let state = null; let audio = null;
  for (let n = 4; n <= 8; n++) { const o = document.createElement('option'); o.value = n; o.textContent = n; $('n').appendChild(o); }
  PRESETS.forEach((p, i) => { const b = document.createElement('button'); b.textContent = p.name; b.dataset.preset = i; b.onclick = () => { load(p); }; $('presets').appendChild(b); });
  function load(p) { $('n').value = p.n; $('pn').value = p.pn; $('bob').value = p.bob; $('single').value = p.single; $('comp').value = p.comp; update(); }

  function update() {
    const n = Number($('n').value); const R = window.Ring;
    $('merr').textContent = ''; $('cerr').textContent = ''; state = null;
    const m = R.makeMethod(n, $('pn').value, $('bob').value, $('single').value);
    if (m.error) { $('merr').textContent = m.error; clear(); return; }
    const c = R.parseComposition($('comp').value);
    if (c.error) { $('cerr').textContent = c.error; clear(); return; }
    if (!c.calls.length) { $('cerr').textContent = 'write at least one lead'; clear(); return; }
    const r = R.ring(m, c.calls);
    if (r.error) { $('cerr').textContent = r.error; clear(); return; }
    const a = R.analyse(r.rows, n); state = { m, calls: c.calls, r, a, n };
    const fact = R.factorial(n);
    $('badges').innerHTML = '';
    const badge = (t, cls) => { const s = document.createElement('span'); s.className = 'badge ' + (cls || ''); s.textContent = t; $('badges').appendChild(s); };
    badge(`${a.length} changes, ${c.calls.length} lead${c.calls.length > 1 ? 's' : ''} of ${m.changes.length}`);
    badge(a.comesRound ? 'comes round' : 'does not come round', a.comesRound ? 'good' : 'bad');
    badge(a.distinct ? (a.comesRound ? 'true' : 'no repeats so far') : 'false', a.distinct ? 'good' : 'bad');
    if (a.extent) badge(`extent: all ${fact} rows once`, 'good');
    const lines = [];
    if (!a.comesRound) lines.push(`After ${a.length} changes the bells are in ${R.rowStr(r.rows[a.length])}, not rounds (${R.rowStr(r.rows[0])}).`);
    if (a.falseGroups.length) {
      const g = a.falseGroups.slice(0, 4).map((x) => `${R.rowStr(r.rows[x[0]])} at changes ${x.join(', ')}`).join('; ');
      lines.push(`${a.falseGroups.length} row${a.falseGroups.length > 1 ? 's repeat' : ' repeats'}: ${g}${a.falseGroups.length > 4 ? '; and more' : ''}.`);
    }
    if (a.true && !a.extent) lines.push(`True, but only ${a.length} of the ${fact} possible rows are used.`);
    $('verdict').textContent = lines.join(' ');
    const sel = $('trace'); const prev = sel.value; sel.innerHTML = '';
    for (let b = 1; b <= n; b++) { const o = document.createElement('option'); o.value = b; o.textContent = b === 1 ? '1 (treble)' : b; sel.appendChild(o); }
    sel.value = prev && Number(prev) <= n ? prev : '2';
    draw(); hash();
  }
  function clear() { $('badges').innerHTML = ''; $('verdict').textContent = ''; $('leads').innerHTML = ''; }

  function draw() {
    if (!state) return; const { m, calls, r, a, n } = state; const R = window.Ring; const L = m.changes.length;
    const follow = Number($('trace').value); const W = 15, H = 17;
    const falseRows = new Set(); a.falseGroups.forEach((g) => g.forEach((i) => falseRows.add(i)));
    const host = $('leads'); host.innerHTML = ''; const NS = 'http://www.w3.org/2000/svg';
    let drawn = 0;
    for (let k = 0; k < calls.length; k++) {
      if (drawn + L > MAX_ROWS) { const p = document.createElement('p'); p.className = 'note'; p.textContent = `Only the first ${drawn} rows are drawn; the result above covers all ${a.length}.`; host.appendChild(p); break; }
      const div = document.createElement('div'); div.className = 'lead'; const h = document.createElement('h3'); h.textContent = `Lead ${k + 1}${calls[k] === 'b' ? ' (bob)' : calls[k] === 's' ? ' (single)' : ''}`; div.appendChild(h);
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', n * W + 4); svg.setAttribute('height', L * H + 4); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Rows of lead ${k + 1}`);
      const pts = [];
      for (let j = 0; j < L; j++) {
        const idx = k * L + j + 1; const row = r.rows[idx]; const y = j * H + 13;
        if (falseRows.has(idx)) { const rect = document.createElementNS(NS, 'rect'); rect.setAttribute('x', 0); rect.setAttribute('y', j * H); rect.setAttribute('width', n * W + 4); rect.setAttribute('height', H); rect.setAttribute('fill', 'var(--badbg)'); svg.appendChild(rect); }
        for (let i = 0; i < n; i++) {
          const t = document.createElementNS(NS, 'text'); t.setAttribute('x', 2 + i * W + W / 2); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle'); t.textContent = R.SYM[row[i] - 1];
          if (row[i] === follow) { t.setAttribute('class', 'sel'); pts.push([2 + i * W + W / 2, y - 4]); } else if (row[i] === 1) t.setAttribute('class', 'tre');
          svg.appendChild(t);
        }
      }
      const line = document.createElementNS(NS, 'polyline'); line.setAttribute('points', pts.map((p) => p.join(',')).join(' ')); line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'var(--accent)'); line.setAttribute('stroke-width', 1.6); line.setAttribute('opacity', .7); svg.appendChild(line);
      div.appendChild(svg); host.appendChild(div); drawn += L;
    }
  }

  function hash() { try { const o = { n: $('n').value, pn: $('pn').value, bob: $('bob').value, single: $('single').value, comp: $('comp').value }; history.replaceState(null, '', '#' + encodeURIComponent(JSON.stringify(o))); } catch (e) { /* ignore */ } }
  function fromHash() { try { const o = JSON.parse(decodeURIComponent(location.hash.slice(1))); if (o && typeof o.pn === 'string' && [4, 5, 6, 7, 8].includes(Number(o.n))) { load({ n: Number(o.n), pn: o.pn, bob: String(o.bob || ''), single: String(o.single || ''), comp: String(o.comp || 'p') }); return true; } } catch (e) { /* default */ } return false; }

  // Sound: a descending diatonic scale, treble highest; one row per beat. Not a listening test.
  function play() {
    if (!state) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) { $('shared').textContent = 'No audio in this browser.'; return; }
    if (audio) { audio.stop(); return; }
    const ctx = new AC(); const n = state.n; const scale = [0, 2, 4, 5, 7, 9, 11, 12]; const base = 261.63; // the tenor is C4; the treble is the highest bell
    const freq = (b) => base * Math.pow(2, scale[n - b] / 12);
    const gap = 0.2; let t = ctx.currentTime + 0.1; const rows = state.r.rows.slice(0, 301);
    for (const row of rows) { for (const b of row) { const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = freq(b); o.type = 'sine'; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.55); t += gap; } t += gap * 0.5; }
    $('play').textContent = 'Stop'; const done = setTimeout(() => stop(), (t - ctx.currentTime) * 1000 + 300);
    function stop() { clearTimeout(done); try { ctx.close(); } catch (e) { /* ignore */ } audio = null; $('play').textContent = 'Play'; }
    audio = { stop };
  }

  function search() {
    const R = window.Ring; update(); if (!state) { $('sumsearch').textContent = 'Fix the method first.'; return; }
    const allow = 'p' + ($('ab').checked ? 'b' : '') + ($('as').checked ? 's' : '');
    const maxLeads = Math.max(1, Math.min(60, Number($('maxl').value) || 12));
    const t0 = performance.now(); const res = R.search(state.m, { maxLeads, allow, limit: 40, nodeBudget: 2000000, extentOnly: $('ext').checked });
    const ms = Math.round(performance.now() - t0);
    const by = Object.keys(res.countByLeads).map(Number).sort((x, y) => x - y).map((k) => `${res.countByLeads[k]} of ${k} lead${k > 1 ? 's' : ''}`).join(', ');
    $('sumsearch').textContent = `${res.total} true touch${res.total === 1 ? '' : 'es'} found${by ? ' (' + by + ')' : ''}; ${res.nodes.toLocaleString()} steps, ${ms} ms. ` + (res.complete ? 'The search finished, so this is every one up to that length.' : 'The search ran out of steps, so there may be more.');
    const ol = $('found'); ol.innerHTML = '';
    for (const t of res.touches) { const li = document.createElement('li'); li.textContent = t.replace(/b/g, '-'); const b = document.createElement('button'); b.textContent = 'Use'; b.onclick = () => { $('comp').value = t; update(); }; li.appendChild(b); ol.appendChild(li); }
    if (res.total > res.touches.length) { const li = document.createElement('li'); li.className = 'note'; li.style.listStyle = 'none'; li.textContent = `and ${res.total - res.touches.length} more`; ol.appendChild(li); }
  }

  ['n', 'pn', 'bob', 'single', 'comp'].forEach((id) => $(id).addEventListener('input', update));
  $('n').addEventListener('change', update); $('trace').addEventListener('change', draw);
  $('play').onclick = play; $('go').onclick = search;
  $('share').onclick = () => { hash(); const u = location.href; const done = () => { $('shared').textContent = 'Link copied.'; }; if (navigator.clipboard) navigator.clipboard.writeText(u).then(done, () => { $('shared').textContent = 'Copy the address bar.'; }); else $('shared').textContent = 'Copy the address bar.'; };
  window.addEventListener('hashchange', () => { fromHash(); });
  if (!fromHash()) load(PRESETS[2]);
})();
