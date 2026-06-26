/* content.js — renders the editable menu + hours (managed in /admin via Decap CMS). */
(function () {
  const esc = s => (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  function renderHours(h) {
    const strip = document.getElementById('hoursStrip');
    if (strip) {
      strip.innerHTML = '';
      (h.days || []).forEach(d => {
        const div = el('div', d.closed ? 'closed' : '');
        div.innerHTML = `<span>${esc(d.day)}</span>${esc(d.hours)}`;
        strip.appendChild(div);
      });
    }
    const note = document.getElementById('hoursNote');
    if (note) note.textContent = h.note || '';
  }

  function renderMenu(m) {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const note = document.getElementById('menuNote');
    if (note && m.note) note.textContent = m.note;
    (m.sections || []).forEach(sec => {
      const isBier = /bier|beer/i.test(sec.title || '');
      const s = el('div', 'menu-section' + (isBier ? ' menu-section--bier' : ''));
      s.appendChild(el('h3', 'menu-cat', esc(sec.title)));
      if (sec.note) s.appendChild(el('p', 'menu-sub', esc(sec.note)));
      (sec.items || []).forEach(it => {
        const price = it.price ? ` <span class="menu-price">${esc(it.price)}</span>` : '';
        s.appendChild(el('div', 'menu-item', `<b>${esc(it.name)}${price}</b><span>${esc(it.desc)}</span>`));
      });
      if (isBier) s.appendChild(el('p', 'prost', 'Prost! 🍺'));
      grid.appendChild(s);
    });
  }

  function load(path) {
    return fetch(path, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  load('content/hours.json').then(renderHours).catch(e => console.error('hours load failed', e));
  load('content/menu.json').then(renderMenu).catch(e => console.error('menu load failed', e));
})();
