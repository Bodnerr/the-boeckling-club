/* editor.js — owner-only in-browser text editor.
 * Turn it on by pressing the "e" key, or by adding #edit to the URL.
 * Customers never see it. Press e -> click any highlighted text -> "Save & Download"
 * -> replace index.html on the host with the downloaded file.
 */
(function () {
  const SEL = [
    '.eyebrow', '.hero h1', '.hero__tag', '.hero__sub', '.hero__badge',
    '.script-accent', 'h2', '.lead', '.hours-strip div', '.hours-note',
    '.story__text p', '.register-badge',
    '.feature h3', '.feature p',
    '.menu-cat', '.menu-sub', '.menu-item b', '.menu-item span', '.menu-note', '.prost',
    '.event-tag', '.event-card h3', '.event-card p',
    '.space__head h3', '.cap', '.space p',
    '.visit__list li', '.form-intro', '.visit__form h3',
    '.footer__brand', '.footer p'
  ].join(',');

  let dirty = false, started = false;

  function start() {
    if (started) return;
    started = true;
    document.body.classList.add('editmode');
    document.querySelectorAll(SEL).forEach(el => {
      if (el.closest('#chatPanel') || el.closest('form') || el.closest('.nav')) return; // skip widgets/nav
      el.setAttribute('contenteditable', 'true');
      el.classList.add('editing');
      el.addEventListener('input', () => { dirty = true; });
    });
    buildBar();
    window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  }

  function buildBar() {
    const bar = document.createElement('div');
    bar.id = 'editbar';
    bar.innerHTML =
      '<span class="editbar__tag">✏️ Edit mode</span>' +
      '<span class="editbar__hint">Click any highlighted text to change it. Customers can’t see this.</span>' +
      '<button id="ebSave">💾 Save &amp; Download</button>' +
      '<button id="ebExit">✕ Exit</button>';
    document.body.appendChild(bar);
    document.getElementById('ebSave').onclick = save;
    document.getElementById('ebExit').onclick = () => { dirty = false; location.hash = ''; location.reload(); };
  }

  function save() {
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('[contenteditable]').forEach(n => { n.removeAttribute('contenteditable'); n.classList.remove('editing'); });
    clone.querySelector('#editbar')?.remove();
    clone.querySelector('body')?.classList.remove('editmode');
    // reset JS-generated bits so the live scripts rebuild them on next load
    ['#chatLog', '#chatQuick'].forEach(s => { const n = clone.querySelector(s); if (n) n.innerHTML = ''; });
    clone.querySelector('#chatPanel')?.setAttribute('hidden', '');
    clone.querySelector('#lightbox')?.remove();
    const yr = clone.querySelector('#year'); if (yr) yr.textContent = '';

    const html = '<!DOCTYPE html>\n' + clone.outerHTML + '\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(a.href);
    dirty = false;
    alert('Downloaded index.html with your edits.\n\nReplace index.html on your host with this file to publish the changes.');
  }

  function inField() {
    const a = document.activeElement;
    return !!a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
  }
  document.addEventListener('keydown', e => {
    if (started || inField()) return;
    if (e.key.toLowerCase() === 'e' && !e.metaKey && !e.ctrlKey && !e.altKey) start();
  });
  function autostart() { if (location.hash.toLowerCase().includes('edit')) start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autostart);
  else autostart();
})();
