// year
document.getElementById('year').textContent = new Date().getFullYear();

// gallery category filter
(() => {
  const filters = document.getElementById('galleryFilters');
  if (!filters) return;
  const imgs = [...document.querySelectorAll('.gallery img')];
  const empty = document.getElementById('galleryEmpty');
  filters.addEventListener('click', e => {
    const btn = e.target.closest('.gfilter');
    if (!btn) return;
    const cat = btn.dataset.filter;
    filters.querySelectorAll('.gfilter').forEach(b => b.classList.toggle('is-active', b === btn));
    let shown = 0;
    imgs.forEach(img => {
      const match = cat === 'all' || img.dataset.cat === cat;
      img.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  });
})();

// mobile nav
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// simple gallery lightbox
const lb = document.createElement('div');
lb.id = 'lightbox';
lb.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(20,12,6,.92);display:none;align-items:center;justify-content:center;cursor:zoom-out;padding:4vw';
lb.innerHTML = '<img style="max-width:94vw;max-height:90vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6)" alt="" />';
document.body.appendChild(lb);
const lbImg = lb.querySelector('img');
document.querySelectorAll('.gallery img').forEach(img => {
  img.addEventListener('click', () => { lbImg.src = img.src; lbImg.alt = img.alt; lb.style.display = 'flex'; });
});
lb.addEventListener('click', () => { lb.style.display = 'none'; lbImg.src = ''; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { lb.style.display = 'none'; } });

// ===== Chatbot (rule-based, free; unanswered questions -> Netlify form -> the club) =====
(function () {
  const btn = document.getElementById('chatBtn');
  const panel = document.getElementById('chatPanel');
  const closeB = document.getElementById('chatClose');
  const log = document.getElementById('chatLog');
  const form = document.getElementById('chatForm');
  const text = document.getElementById('chatText');
  const quickWrap = document.getElementById('chatQuick');
  if (!btn) return;

  const KB = [
    { k:['hour','open','close','time','today'], a:"We're open Tue–Fri 5–10pm, Sat noon–10pm, Sun noon–6pm. Closed Mondays. (Summer hours.)" },
    { k:['menu','food','eat','sausage','brat','pretzel','schnitzel','vegetarian','dinner'], a:"Our German kitchen has house-made sausages (knackwurst, bratwurst, Hungarian), soft pretzels with bier cheese, sauerkraut balls, currywurst, plus sides like rotkohl & German potato salad. Full menu's on the page under “Menu.”" },
    { k:['bier','beer','drink','draught','draft','paulaner','hofbrau','wine','bar'], a:"We pour imported German draught — Paulaner Hefe-Weizen, Salvator Doppelbock, Hofbräu Original, Franziskaner Weissbier & Spaten Optimator. Flights, growlers & pitchers available. Prost! 🍺" },
    { k:['reservation','reserve','book a table','table','walk'], a:"For a table, walk-ins are welcome — for larger parties, call us at (419) 656-8764 and we'll take care of you." },
    { k:['hall','rent','rental','wedding','event space','party','banquet','funeral','anniversary','graduation','meeting'], a:"Yes! The Grand Hall (Palm Room) seats up to 200, and Boeckling's Parlor up to 30 — great for weddings, celebrations of life, graduations & meetings. Kitchen access and food/drink packages available. Want me to pass your details to the club?" },
    { k:['oktoberfest','christkindl','christmas','springfest','event','festival','music','polka','live'], a:"We host Sandusky's oldest Oktoberfest (September), a Christkindlmarkt (December) and Springfest. Check the “Events” section, and ask to join our newsletter for dates!" },
    { k:['where','location','address','parking','directions','find'], a:"We're at 614 Columbus Avenue, Sandusky, OH 44870 — the historic 1914 Boeckling home. Map's in the “Visit” section." },
    { k:['office'], a:"We also offer office rental in the building — happy to share details; want me to pass your info to the club?" },
    { k:['phone','call','contact','email','reach','number'], a:"Call or text (419) 656-8764, or email boecklingclub@gmail.com. You can also leave a note here and we'll get back to you." },
    { k:['history','old','1914','boeckling','cedar point','built'], a:"The club is the 1914 home of George Boeckling — the man who built Cedar Point! It's on the National Register of Historic Places. See the “Story” section." },
    { k:['hello','hi','hey','guten','hallo'], a:"Willkommen! 🍺 Ask me about our hours, menu, bier, events or renting the hall." },
    { k:['thank','danke'], a:"Gern geschehen — you're welcome! Anything else?" }
  ];
  const QUICK = ['Hours?', 'Hall rental', 'Menu & bier', 'Events'];

  let cap = null, capMsg = '';
  function add(t, who){ const d=document.createElement('div'); d.className='msg msg--'+who; d.textContent=t; log.appendChild(d); log.scrollTop=log.scrollHeight; }
  function answer(q){
    const s=q.toLowerCase();
    const hit=KB.find(i=>i.k.some(k=>s.includes(k)));
    return hit ? hit.a : null;
  }
  async function sendToClub(message, contact){
    try{
      await fetch('/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({'form-name':'chatbot', message, contact}).toString()});
    }catch(e){ /* on preview/local this no-ops; live Netlify delivers it */ }
  }
  function reply(q){
    setTimeout(()=>{
      if(cap==='msg'){ capMsg=q; cap='contact'; add("Got it. What's the best email or phone to reach you?", 'bot'); return; }
      if(cap==='contact'){ sendToClub(capMsg, q); cap=null; add("Danke! 🍺 Your message is on its way to the club — we'll be in touch soon.", 'bot'); return; }
      const a=answer(q);
      if(a){ add(a,'bot'); }
      else { cap='msg'; add("Great question — let me get that to the club so we can answer properly. What would you like to ask?", 'bot'); }
    }, 350);
  }

  btn.addEventListener('click', ()=>{
    const opening = panel.hasAttribute('hidden');
    if(opening){
      panel.removeAttribute('hidden');
      if(!log.children.length){
        add("Willkommen to The Boeckling Club! 🍺 I can help with hours, menu, bier, events or renting the hall.", 'bot');
        QUICK.forEach(q=>{ const b=document.createElement('button'); b.textContent=q; b.onclick=()=>{ add(q,'user'); reply(q); }; quickWrap.appendChild(b); });
      }
      text.focus();
    } else panel.setAttribute('hidden','');
  });
  closeB.addEventListener('click', ()=>panel.setAttribute('hidden',''));
  form.addEventListener('submit', e=>{ e.preventDefault(); const q=text.value.trim(); if(!q) return; add(q,'user'); text.value=''; reply(q); });
})();
