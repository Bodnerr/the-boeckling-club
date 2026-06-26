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

  function renderGallery(g) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    (g.photos || []).forEach(p => {
      const img = document.createElement('img');
      img.src = p.image; img.alt = p.alt || ''; img.loading = 'lazy';
      if (p.cat) img.dataset.cat = p.cat;
      grid.appendChild(img);
    });
    initFilter(grid);
    initLightbox(grid);
  }

  function initFilter(grid) {
    const filters = document.getElementById('galleryFilters');
    if (!filters) return;
    const empty = document.getElementById('galleryEmpty');
    filters.onclick = e => {
      const btn = e.target.closest('.gfilter');
      if (!btn) return;
      const cat = btn.dataset.filter;
      filters.querySelectorAll('.gfilter').forEach(b => b.classList.toggle('is-active', b === btn));
      let shown = 0;
      grid.querySelectorAll('img').forEach(img => {
        const match = cat === 'all' || img.dataset.cat === cat;
        img.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
  }

  function initLightbox(grid) {
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(20,12,6,.92);display:none;align-items:center;justify-content:center;cursor:zoom-out;padding:4vw';
      lb.innerHTML = '<img style="max-width:94vw;max-height:90vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6)" alt="" />';
      document.body.appendChild(lb);
      lb.addEventListener('click', () => { lb.style.display = 'none'; });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.style.display = 'none'; });
    }
    const lbImg = lb.querySelector('img');
    grid.addEventListener('click', e => {
      const img = e.target.closest('img');
      if (!img) return;
      lbImg.src = img.src; lbImg.alt = img.alt; lb.style.display = 'flex';
    });
  }

  function load(path) {
    return fetch(path, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  load('content/hours.json').then(renderHours).catch(e => console.error('hours load failed', e));
  load('content/menu.json').then(renderMenu).catch(e => console.error('menu load failed', e));
  load('content/gallery.json').then(renderGallery).catch(e => console.error('gallery load failed', e));
})();
