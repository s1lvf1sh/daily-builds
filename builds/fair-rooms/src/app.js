(function () {
  'use strict';
  const FR = window.FairRooms; const $ = (id) => document.getElementById(id);
  const MAX = 6, MIN = 2;
  const PRESETS = {
    'Three friends': { rent: '2400', names: ['Ana', 'Ben', 'Caz'], rooms: ['Big', 'Middle', 'Small'], bids: [['1300', '700', '400'], ['1000', '900', '500'], ['900', '800', '700']] },
    'Same tastes': { rent: '1800', names: ['Dee', 'Eli', 'Fay'], rooms: ['Front', 'Back', 'Attic'], bids: [['800', '600', '400'], ['800', '600', '400'], ['800', '600', '400']] },
    'A cheapskate': { rent: '2000', names: ['Gus', 'Hal'], rooms: ['Master', 'Box room'], bids: [['1900', '100'], ['1000', '1000']] },
  };
  let state = JSON.parse(JSON.stringify(PRESETS['Three friends'])); let last = null;
  function load() { try { const h = decodeURIComponent(location.hash.slice(1)); if (h) { const s = JSON.parse(h); if (valid(s)) state = s; } } catch (e) { /* ignore a broken link */ } }
  function valid(s) { return s && typeof s.rent === 'string' && Array.isArray(s.names) && s.names.length >= MIN && s.names.length <= MAX && Array.isArray(s.rooms) && s.rooms.length === s.names.length && Array.isArray(s.bids) && s.bids.length === s.names.length && s.bids.every((r) => Array.isArray(r) && r.length === s.names.length && r.every((x) => typeof x === 'string')) && s.names.concat(s.rooms).every((x) => typeof x === 'string'); }
  function save() { try { history.replaceState(null, '', '#' + encodeURIComponent(JSON.stringify(state))); } catch (e) { /* file: pages may refuse */ } }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nm = (s, i, k) => (s.trim() || k + ' ' + (i + 1));

  function buildGrid() {
    const n = state.names.length; let h = '<thead><tr><th>Person \\ Room</th>';
    for (let j = 0; j < n; j++) h += `<th><input type="text" data-room="${j}" value="${esc(state.rooms[j])}" aria-label="Room ${j + 1} name" /></th>`;
    h += '<th>Bid total</th></tr></thead><tbody>';
    for (let i = 0; i < n; i++) {
      h += `<tr><th><input type="text" data-name="${i}" value="${esc(state.names[i])}" aria-label="Person ${i + 1} name" /></th>`;
      for (let j = 0; j < n; j++) h += `<td><input type="text" class="num" inputmode="decimal" data-bid="${i},${j}" value="${esc(state.bids[i][j])}" aria-label="${esc(nm(state.names[i], i, 'Person'))} bid on ${esc(nm(state.rooms[j], j, 'Room'))}" /></td>`;
      h += `<td class="note" data-total="${i}"></td></tr>`;
    }
    $('grid').innerHTML = h + '</tbody>'; $('count').textContent = n + ' people, ' + n + ' rooms';
    $('addp').disabled = n >= MAX; $('delp').disabled = n <= MIN;
  }

  function compute() {
    const n = state.names.length; const err = $('err'); err.textContent = '';
    const rent = FR.parse(state.rent); if (!rent || rent.n < 0n) return fail('The rent must be a number, zero or more.');
    let v = [];
    for (let i = 0; i < n; i++) {
      const row = []; for (let j = 0; j < n; j++) { const x = FR.parse(state.bids[i][j]); if (!x || x.n < 0n) return fail(`${nm(state.names[i], i, 'Person')}'s bid on ${nm(state.rooms[j], j, 'Room')} must be a number, zero or more.`); row.push(x); }
      let tot = FR.ZERO; row.forEach((x) => { tot = FR.add(tot, x); });
      const cell = document.querySelector(`[data-total="${i}"]`); if (cell) cell.textContent = FR.fmt(tot, 2);
      if ($('norm').checked) { if (tot.n === 0n) return fail(`${nm(state.names[i], i, 'Person')} has bid nothing anywhere. Give at least one room a value.`); for (let j = 0; j < n; j++) row[j] = FR.div(FR.mul(row[j], rent), tot); }
      v.push(row);
    }
    const r = FR.solve(v, rent); const chk = FR.check(v, rent, r.sigma, r.price); if (!chk.ok) return fail('Internal check failed: ' + chk.problems.join('; '));
    const cents = FR.toCents(r.price, rent, v, r.sigma); last = { v, rent, r, cents }; return last;
    function fail(msg) { err.textContent = msg; return null; }
  }

  function render() {
    const res = compute(); $('out').hidden = !res; if (!res) return;
    const { v, rent, r, cents } = res; const n = v.length; const rn = (j) => nm(state.rooms[j], j, 'Room'), pn = (i) => nm(state.names[i], i, 'Person');
    let maxP = FR.F(1); r.price.forEach((p) => { if (FR.cmp(p, maxP) > 0) maxP = p; });
    $('assign').innerHTML = state.names.map((_, i) => { const a = r.assigned[i]; const w = Math.max(2, Math.min(100, Number(FR.div(FR.mul(a.price, FR.F(100)), maxP).n / FR.div(FR.mul(a.price, FR.F(100)), maxP).d))); return `<div class="card"><b>${esc(pn(i))}</b> gets <b>${esc(rn(a.room))}</b><div class="price">${esc(FR.fmt(cents.rounded[a.room], 2))}</div><div class="note">exact ${esc(FR.fmt(a.price, 4))}<br>gain ${esc(FR.fmt(FR.sub(v[i][a.room], cents.rounded[a.room]), 2))} (bid ${esc(FR.fmt(v[i][a.room], 2))})</div><div class="bar" style="width:${w}%"></div></div>`; }).join('');
    const minGain = FR.fmt(r.u, 2);
    $('summary').innerHTML = `<span class="badge">Envy-free</span> The least-happy person still comes out <b>${esc(minGain)}</b> ahead (their room's value minus its price). No other envy-free split does better for them. Prices sum to ${esc(FR.fmt(rent, 2))}.` + (cents.envyFree ? '' : ` <span class="err">After rounding to cents someone could prefer another room by ${esc(FR.fmt(cents.worstEnvy, 2))}; the exact prices above have no envy.</span>`);
    let h = '<thead><tr><th>Person</th>' + state.rooms.map((_, j) => `<th>${esc(rn(j))}<br><span class="note">${esc(FR.fmt(cents.rounded[j], 2))}</span></th>`).join('') + '</tr></thead><tbody>';
    for (let i = 0; i < n; i++) { h += `<tr><th>${esc(pn(i))}</th>`; for (let j = 0; j < n; j++) { const g = FR.sub(v[i][j], cents.rounded[j]); h += `<td class="${j === r.sigma[i] ? 'best' : ''} ${g.n < 0n ? 'neg' : ''}">${esc(FR.fmt(g, 2))}</td>`; } h += '</tr>'; }
    $('envy').innerHTML = h + '</tbody>';
    $('method').textContent = 'Method: rooms go to the people who value them most in total, then prices are chosen by an exact linear program (rational arithmetic) so that the least-happy person is as happy as possible while nobody envies. Prices can be negative if a room is unwanted enough: that person is paid to take it.';
    save();
  }

  function resize(n) { const s = state; while (s.names.length < n) { const i = s.names.length; s.names.push('Person ' + (i + 1)); s.rooms.push('Room ' + (i + 1)); s.bids.forEach((r) => r.push('0')); s.bids.push(new Array(i + 1).fill('1')); } while (s.names.length > n) { s.names.pop(); s.rooms.pop(); s.bids.pop(); s.bids.forEach((r) => r.pop()); } }
  $('grid').addEventListener('input', (e) => { const t = e.target; if (t.dataset.name !== undefined) state.names[+t.dataset.name] = t.value; else if (t.dataset.room !== undefined) state.rooms[+t.dataset.room] = t.value; else if (t.dataset.bid !== undefined) { const [i, j] = t.dataset.bid.split(',').map(Number); state.bids[i][j] = t.value; } render(); });
  $('rent').addEventListener('input', () => { state.rent = $('rent').value; render(); }); $('norm').addEventListener('change', render);
  $('addp').addEventListener('click', () => { resize(state.names.length + 1); buildGrid(); render(); }); $('delp').addEventListener('click', () => { resize(state.names.length - 1); buildGrid(); render(); });
  Object.keys(PRESETS).forEach((k) => { const b = document.createElement('button'); b.textContent = k; b.addEventListener('click', () => { state = JSON.parse(JSON.stringify(PRESETS[k])); $('rent').value = state.rent; buildGrid(); render(); }); $('presets').appendChild(b); });
  $('share').addEventListener('click', () => { save(); const done = () => { $('shared').textContent = 'Link copied.'; }; if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, () => { $('shared').textContent = 'Copy the address bar.'; }); else $('shared').textContent = 'Copy the address bar.'; });
  load(); $('rent').value = state.rent; buildGrid(); render();
  window.__fairLast = () => last;
})();
