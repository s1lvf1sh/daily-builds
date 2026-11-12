(function () {
  const S = Sandpile, $ = (id) => document.getElementById(id), cv = $('cv'), ctx = cv.getContext('2d');
  const PAL = [[20, 33, 61], [42, 157, 143], [233, 196, 106], [231, 111, 81]];
  let w = 43, h = 43, cfg = S.filled(w, h, 0), running = false, anim = 0, ident = null;
  function draw() {
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < w * h; i++) { const v = cfg[i], c = PAL[v > 3 ? 3 : v], o = i * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = 255; if (v > 3) { img.data[o] = 255; img.data[o + 1] = 255; img.data[o + 2] = 255; } }
    ctx.putImageData(img, 0, 0); cv.style.aspectRatio = w + ' / ' + h;
  }
  function say(t, cls) { const m = $('msg'); m.textContent = t; m.className = cls || ''; }
  function relax() { // animate parallel topple rounds until stable
    if (running) return; running = true;
    const tick = () => {
      const n = +$('speed').value; let any = false;
      for (let k = 0; k < n; k++) { if (S.step(cfg, w, h)) any = true; else break; }
      draw();
      if (any) anim = requestAnimationFrame(tick); else { running = false; cv.dataset.settled = '1'; }
    };
    cv.dataset.settled = '0'; anim = requestAnimationFrame(tick);
  }
  function settleNow() { cancelAnimationFrame(anim); running = false; S.stabilize(cfg, w, h); draw(); cv.dataset.settled = '1'; }
  function getIdentity() { if (!ident || ident.w !== w || ident.h !== h) ident = { w, h, e: S.identity(w, h) }; return ident.e; }
  function resize() { settleNow(); w = +$('w').value; h = +$('h').value; if ($('sq').checked) { h = w; $('h').value = h; } $('wv').textContent = w; $('hv').textContent = h; cfg = S.filled(w, h, 0); draw(); say('New grid. Press “Show the identity”.'); }
  function checks() {
    settleNow(); const e = getIdentity(); const rec = S.isRecurrent(cfg, w, h); const eIsRec = S.isRecurrent(e, w, h); const ee = S.equal(S.add(e, e, w, h), e); const ea = rec ? S.equal(S.add(e, cfg, w, h), cfg) : null;
    const hs = S.hist(cfg), tot = hs.reduce((a, b, i) => a + b * i, 0);
    const lines = [`Grains: ${tot} (0:${hs[0]} 1:${hs[1]} 2:${hs[2]} 3:${hs[3]})`, `This pile is ${rec ? 'recurrent' : 'not recurrent'}.`, `Identity is recurrent: ${eIsRec ? 'yes' : 'NO'}`, `e + e = e: ${ee ? 'yes' : 'NO'}`, rec ? `e + this pile = this pile: ${ea ? 'yes' : 'NO'}` : 'e + this pile = this pile: not applicable (not recurrent)'];
    say(lines.join('\n'), eIsRec && ee && ea !== false ? 'good' : 'badc'); $('msg').style.whiteSpace = 'pre-line';
  }
  $('w').oninput = $('h').oninput = (ev) => { if (ev.target.id === 'h') $('sq').checked = false; resize(); };
  $('sq').onchange = resize;
  $('bId').onclick = () => { settleNow(); cfg = Int32Array.from(getIdentity()); draw(); checks(); };
  $('bAddId').onclick = () => { settleNow(); const before = Int32Array.from(cfg), e = getIdentity(); for (let i = 0; i < cfg.length; i++) cfg[i] += e[i]; relax(); const wait = () => { if (running) return setTimeout(wait, 30); say(S.equal(before, cfg) ? 'The pile ended exactly as it began.' : 'The pile changed: it was not recurrent.', S.equal(before, cfg) ? 'good' : 'badc'); }; wait(); };
  $('bRand').onclick = () => { settleNow(); cfg = S.randomRecurrent(w, h, (Math.random() * 1e9) | 0); draw(); say('A random recurrent pile. Try “Add identity to pile”.'); };
  $('bFull').onclick = () => { settleNow(); cfg = S.filled(w, h, 3); draw(); say('All cells at 3: the largest stable pile.'); };
  $('bClear').onclick = () => { settleNow(); cfg = S.filled(w, h, 0); draw(); say('Cleared.'); };
  $('bCheck').onclick = checks;
  let down = false;
  function drop(ev) { const r = cv.getBoundingClientRect(), x = Math.floor((ev.clientX - r.left) / r.width * w), y = Math.floor((ev.clientY - r.top) / r.height * h); if (x < 0 || y < 0 || x >= w || y >= h) return; cfg[y * w + x] += ev.shiftKey ? 1 : 20; draw(); relax(); }
  cv.addEventListener('pointerdown', (e) => { down = true; drop(e); }); cv.addEventListener('pointermove', (e) => { if (down) drop(e); }); window.addEventListener('pointerup', () => { down = false; });
  window.__sandpile = { get cfg() { return cfg; }, get w() { return w; }, get h() { return h; } };
  $('wv').textContent = w; $('hv').textContent = h; draw(); $('bId').click();
})();
