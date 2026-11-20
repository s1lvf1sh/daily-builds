(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const PRESETS = [];
  PRESETS.push(
    { name: 'Shelving', unit: 'in', kerf: '1/8', stock: '96\n144', pieces: '59 x 3\n41 x 3\n26 x 4\n47 x 3' },
    { name: 'Bookcase', unit: 'in', kerf: '1/8', stock: '96 @ 14.50\n120 @ 19.80', pieces: '36 x 4  # sides and divider\n34 1/2 x 6  # shelves\n12 x 8\n47 x 2' },
    { name: 'Fence rails', unit: 'in', kerf: '1/8', stock: '96\n144', pieces: '71 x 6\n46 1/2 x 8\n22 x 12' },
    { name: 'Metric trim', unit: 'mm', kerf: '3', stock: '2400\n3000', pieces: '870 x 6\n620 x 8\n455 x 10\n300 x 7' },
    { name: 'Tight (kerf matters)', unit: 'mm', kerf: '2', stock: '1000', pieces: '499 x 4\n333 x 3' }
  );
  let current = null, lastInput = null;

  function readState() { return { pieces: $('pieces').value, stock: $('stock').value, unit: $('unit').value, kerf: $('kerf').value }; }
  function writeState(s) { $('pieces').value = s.pieces; $('stock').value = s.stock; $('unit').value = s.unit; $('kerf').value = s.kerf; }
  function saveHash() { try { history.replaceState(null, '', '#' + encodeURIComponent(JSON.stringify(readState()))); } catch (e) { /* file:// quirks */ } }

  const C = window.Cut;
  const money = (c) => (c / 100).toFixed(2);
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

  function render(ms) {
    const st = readState(); const u = st.unit;
    $('badges').textContent = ''; $('shop').textContent = ''; $('boards').textContent = ''; $('foot').textContent = ''; $('longer').hidden = true; current = null;
    const input = C.parseInput(st.pieces, st.stock, st.kerf, u);
    $('err').textContent = input.error || '';
    if (input.error) return;
    const plan = C.solve(input, { ms: ms || 3000 });
    if (plan.error) { $('err').textContent = plan.error; return; }
    current = { plan, input, u }; lastInput = input;
    const bad = C.validatePlan(plan, input);
    if (bad) { $('err').textContent = 'Internal error, plan failed its own check: ' + bad; return; }
    const costed = input.costed;
    const totalPieces = input.pieces.reduce((a, p) => a + p.qty, 0);
    const bought = plan.boards.reduce((a, b) => a + b.stock, 0), used = plan.boards.reduce((a, b) => a + b.used, 0);
    const badge = (t, c) => { const b = el('span', 'badge ' + (c || ''), t); $('badges').appendChild(b); };
    badge(`${plan.nBoards} board${plan.nBoards === 1 ? '' : 's'} for ${totalPieces} pieces`);
    if (costed) badge('total ' + money(plan.cost));
    badge(`${Math.round(((bought - used) / bought) * 1000) / 10}% of what you buy is offcut`);
    if (plan.optimal) badge('proven cheapest', 'good'); else { badge('not proven cheapest: ' + plan.reason, 'warn'); $('longer').hidden = false; }
    const base = plan.baseline;
    if (plan.optimal) {
      const saved = base.cost - plan.cost;
      if (saved > 0) badge(costed ? `saves ${money(saved)} against first-fit` : `${C.fmt(saved, u)} ${u} less board than first-fit`, 'good');
      else badge('first-fit would have matched it');
    }
    // shopping list
    const counts = new Map(); plan.boards.forEach((b) => counts.set(b.stock, (counts.get(b.stock) || 0) + 1));
    const t = el('table'); const hr = el('tr'); ['Buy', 'Board length'].concat(costed ? ['Each', 'Sum'] : []).forEach((h) => hr.appendChild(el('th', '', h))); t.appendChild(hr);
    [...counts].sort((a, b) => b[0] - a[0]).forEach(([len, n]) => {
      const tr = el('tr'); tr.appendChild(el('td', '', n + ' ×')); tr.appendChild(el('td', '', C.fmt(len, u) + ' ' + u));
      if (costed) { const c = input.stocks.find((s) => s.len === len).cost; tr.appendChild(el('td', '', money(c))); tr.appendChild(el('td', '', money(c * n))); }
      t.appendChild(tr);
    });
    $('shop').appendChild(t);
    // boards
    const hue = new Map(); input.pieces.slice().sort((a, b) => b.len - a.len).forEach((p, i, a) => hue.set(p.len, Math.round((i * 360) / Math.max(a.length, 1) + 20) % 360));
    const sorted = plan.boards.slice().sort((a, b) => b.stock - a.stock || b.pieces.length - a.pieces.length || b.pieces[0] - a.pieces[0]);
    sorted.forEach((b, bi) => {
      const card = el('div', 'board'); const h = el('h3');
      h.appendChild(el('span', '', `Board ${bi + 1}: ${C.fmt(b.stock, u)} ${u}`)); h.appendChild(el('span', '', `offcut ${C.fmt(b.waste, u)} ${u}`));
      const strip = el('div', 'strip'); strip.setAttribute('role', 'img'); strip.setAttribute('aria-label', 'Cuts: ' + b.pieces.map((x) => C.fmt(x, u)).join(', ') + '; offcut ' + C.fmt(b.waste, u));
      b.pieces.forEach((len, i) => {
        if (i > 0 && input.kerf > 0) { const k = el('div', 'kerf'); k.style.width = Math.max((input.kerf / b.stock) * 100, 0.25) + '%'; strip.appendChild(k); }
        const s = el('div', 'seg', C.fmt(len, u)); s.style.width = (len / b.stock) * 100 + '%'; s.style.background = `hsl(${hue.get(len)} var(--sat) var(--lig))`; strip.appendChild(s);
      });
      const off = el('div', 'off', b.waste > 0 ? C.fmt(b.waste, u) : ''); strip.appendChild(off);
      card.appendChild(h); card.appendChild(strip); $('boards').appendChild(card);
    });
    $('foot').textContent = `Kerf ${C.fmt(input.kerf, u)} ${u} between pieces on a board. A piece set against the board's end needs no cut there, and the last offcut is yours to keep. ` + (plan.optimal ? `Searched ${plan.states.toLocaleString()} partial plans.` : '');
    saveHash();
  }

  function asText() {
    if (!current) return '';
    const { plan, input, u } = current; const lines = [];
    [...plan.boards].sort((a, b) => b.stock - a.stock || b.pieces.length - a.pieces.length).forEach((b, i) => lines.push(`Board ${i + 1} (${C.fmt(b.stock, u)} ${u}): ` + b.pieces.map((x) => C.fmt(x, u)).join(' + ') + `  | offcut ${C.fmt(b.waste, u)}`));
    return `Cut list, kerf ${C.fmt(input.kerf, u)} ${u}\n` + lines.join('\n');
  }

  PRESETS.forEach((p) => { const b = el('button', '', p.name); b.addEventListener('click', () => { writeState(p); render(); }); $('presets').appendChild(b); });
  ['pieces', 'stock', 'kerf'].forEach((id) => $(id).addEventListener('input', () => render()));
  $('unit').addEventListener('change', () => render());
  $('longer').addEventListener('click', () => { $('msg').textContent = 'Searching…'; setTimeout(() => { render(30000); $('msg').textContent = ''; }, 30); });
  $('print').addEventListener('click', () => window.print());
  $('share').addEventListener('click', async () => { saveHash(); try { await navigator.clipboard.writeText(location.href); $('msg').textContent = 'Link copied.'; } catch (e) { $('msg').textContent = 'Copy the address bar to share.'; } });
  $('copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(asText()); $('msg').textContent = 'Copied.'; } catch (e) { $('msg').textContent = 'Could not copy here.'; } });
  window.__cutText = asText;

  let start = PRESETS[0];
  try { const h = decodeURIComponent(location.hash.slice(1)); if (h) { const s = JSON.parse(h); if (s && ['pieces', 'stock', 'unit', 'kerf'].every((k) => typeof s[k] === 'string') && C.UNITS[s.unit]) start = s; } } catch (e) { /* use the default */ }
  writeState(start); render();
})();
