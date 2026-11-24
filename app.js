/* ---------- scroll-scrubbed film (frame sequence on canvas) ---------- */
function Film(section){
  const dir = section.dataset.frames, n = +section.dataset.count;
  const canvas = section.querySelector('canvas'), ctx = canvas.getContext('2d');
  const bar = section.querySelector('.progress i');
  const chapters = [...section.querySelectorAll('.chapter')];
  const foot = section.querySelector('.film-foot');
  const hint = section.querySelector('.scroll-hint');
  const counters = [...section.querySelectorAll('[data-count-to]')];
  const imgs = new Array(n); let loaded = 0, target = 0, cur = 0, last = -1, counted = false;

  const src = i => dir + String(i + 1).padStart(3, '0') + '.webp';
  function load(i){
    if (imgs[i]) return;
    const im = new Image(); im.decoding = 'async'; im.src = src(i);
    im.onload = () => { loaded++; if (i === 0) size(); draw(true); };
    imgs[i] = im;
  }
  // first frame now, then every 6th (coarse scrub), then fill the gaps
  load(0);
  const order = []; for (let i = 0; i < n; i += 6) order.push(i);
  for (let i = 0; i < n; i++) if (i % 6) order.push(i);
  let k = 0; (function pump(){ for (let j = 0; j < 8 && k < order.length; j++) load(order[k++]); if (k < order.length) setTimeout(pump, 40); })();

  function size(){
    const im = imgs[0]; if (!im || !im.naturalWidth) return;
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); last = -1;
  }
  function nearest(i){ for (let d = 0; d < n; d++){ for (const j of [i - d, i + d]) if (j >= 0 && j < n && imgs[j] && imgs[j].complete && imgs[j].naturalWidth) return imgs[j]; } }
  function draw(force){
    const i = Math.max(0, Math.min(n - 1, Math.round(cur * (n - 1))));
    if (i === last && !force) return; last = i;
    const im = nearest(i); if (!im) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
  }
  function measure(){
    const r = section.getBoundingClientRect(), total = section.offsetHeight - innerHeight + 104;
    target = Math.max(0, Math.min(1, -r.top / total));
  }
  function ui(){
    if (bar) bar.style.width = (cur * 100) + '%';
    chapters.forEach(c => c.classList.toggle('on', cur >= +c.dataset.from && cur < +c.dataset.to));
    if (foot) foot.classList.toggle('on', cur > .9);
    if (hint) hint.style.opacity = cur > .04 ? 0 : 1;
    if (!counted && cur > .25 && counters.length){
      counted = true;
      counters.forEach(el => { const to = +el.dataset.countTo, t0 = performance.now();
        (function f(t){ const p = Math.min(1, (t - t0) / 1600); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(f); })(t0); });
    }
  }
  function tick(){
    measure(); cur += (target - cur) * .14; if (Math.abs(target - cur) < .0005) cur = target;
    draw(); ui(); requestAnimationFrame(tick);
  }
  addEventListener('resize', () => { size(); draw(true); });
  size(); tick();
}
document.querySelectorAll('.film').forEach(Film);

/* ---------- parametric SVG cakes (product art) ---------- */
function cakeSVG(o){
  const { sponge='#6b3f2a', frost='#4a2c20', cream='#f5e3c0', top='berries', layers=2, drip=true, extra } = o;
  let s = `<svg viewBox="0 0 300 260" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="150" cy="232" rx="105" ry="12" fill="rgba(74,44,32,.18)"/>`;
  const h = 48, baseY = 222, top0 = baseY - layers * h;
  for (let i = 0; i < layers; i++){
    const y = baseY - (i + 1) * h;
    s += `<rect x="52" y="${y}" width="196" height="${h}" fill="${sponge}"/>`;
    if (i < layers - 1) s += `<rect x="50" y="${y - 3}" width="200" height="8" rx="4" fill="${cream}"/>`;
  }
  s += `<ellipse cx="150" cy="${baseY}" rx="98" ry="14" fill="${sponge}"/>`;
  s += `<rect x="52" y="${top0}" width="196" height="12" fill="${frost}"/>`;
  if (drip){
    let d = `M50 ${top0 - 4} H250 V${top0 + 10}`;
    const xs = [236, 214, 196, 170, 146, 122, 98, 76, 58];
    xs.forEach((x, i) => { const l = 16 + ((i * 37) % 30); d += ` Q${x + 8} ${top0 + 10 + l} ${x} ${top0 + 10 + l - 4} Q${x - 6} ${top0 + 8} ${x - 12} ${top0 + 10}`; });
    d += ` L50 ${top0 + 8} Z`; s += `<path d="${d}" fill="${frost}"/>`;
  }
  s += `<ellipse cx="150" cy="${top0 - 2}" rx="100" ry="15" fill="${frost}"/><ellipse cx="150" cy="${top0 - 5}" rx="88" ry="10" fill="rgba(255,255,255,.14)"/>`;
  const cy = top0 - 6;
  const berry = (x, y, c) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/><circle cx="${x - 3}" cy="${y - 3}" r="2.5" fill="rgba(255,255,255,.55)"/>`;
  if (top === 'berries') s += berry(118, cy - 6, '#c8264a') + berry(150, cy - 10, '#2b1d33') + berry(182, cy - 6, '#c8264a') + berry(134, cy + 2, '#2b1d33') + berry(168, cy + 2, '#c8264a') + `<path d="M120 ${cy - 18} q18 -26 40 -4 q-10 -2 -18 8z" fill="#5a3322"/>`;
  if (top === 'cherry') s += `<path d="M150 ${cy - 8} q10 -26 26 -30" stroke="#3b6b2c" stroke-width="3" fill="none"/>` + berry(150, cy - 8, '#b8142c') + berry(112, cy + 2, '#b8142c') + berry(188, cy + 2, '#b8142c') + `<g fill="#fff" opacity=".85"><path d="M90 ${cy - 4} q6 -10 12 0 q-6 4 -12 0zM198 ${cy - 4} q6 -10 12 0 q-6 4 -12 0z"/></g>`;
  if (top === 'pineapple') [[112, 0], [150, -6], [188, 0]].forEach(([x, dy]) => s += `<path d="M${x - 16} ${cy + dy} a16 14 0 0 1 32 0 a16 10 0 0 1 -32 0z" fill="#f3c52b" stroke="#d99a12" stroke-width="2"/><circle cx="${x}" cy="${cy + dy - 2}" r="4" fill="#fff6c0"/>`);
  if (top === 'roses') [[108, 0], [150, -8], [192, 0], [130, 4], [172, 4]].forEach(([x, dy]) => s += `<circle cx="${x}" cy="${cy + dy}" r="11" fill="#e0607e"/><path d="M${x - 6} ${cy + dy} a6 6 0 1 1 12 0 a3 3 0 1 1 -6 0" fill="none" stroke="#a82e52" stroke-width="2"/>`);
  if (top === 'nuts') for (let i = 0; i < 9; i++) s += `<ellipse cx="${100 + i * 12}" cy="${cy + (i % 2) * 5 - 4}" rx="7" ry="4" fill="#b88a4a" transform="rotate(${i * 30} ${100 + i * 12} ${cy})"/>`;
  if (top === 'kitkat') for (let i = 0; i < 6; i++){ const a = (i / 6) * Math.PI * 2; s += `<rect x="${150 + Math.cos(a) * 80 - 5}" y="${top0 - 8 - 24}" width="10" height="38" rx="2" fill="#7a3420" transform="rotate(${Math.cos(a) * 22} ${150 + Math.cos(a) * 80} ${top0})"/>`; }
  if (top === 'oreo') [[120, 0], [150, -6], [180, 0]].forEach(([x, dy]) => s += `<circle cx="${x}" cy="${cy + dy}" r="12" fill="#1e1814"/><circle cx="${x}" cy="${cy + dy}" r="6" fill="#efe7d6"/>`);
  if (top === 'petals') for (let i = 0; i < 10; i++) s += `<ellipse cx="${100 + i * 11}" cy="${cy + (i % 3) * 3 - 3}" rx="6" ry="3.5" fill="${i % 2 ? '#e87a96' : '#f6b6c8'}" transform="rotate(${i * 25} ${100 + i * 11} ${cy})"/>`;
  return s + (extra || '') + `</svg>`;
}

const P = [
  { n: 'Midnight Truffle Cake', p: 549, r: 4.9, rv: '9.2K', f: ['choc'], img: 'media/cake-choc.webp', tag: 'Signature' },
  { n: 'Almond Orchard Cake', p: 649, r: 4.9, rv: '2.5K', f: ['fruit'], a: { sponge: '#f1d9a0', frost: '#fff3d6', cream: '#fff', top: 'nuts', drip: false } },
  { n: 'Caramel Crunch Cake', p: 529, r: 5, rv: '73', f: ['egg'], a: { sponge: '#e0b46a', frost: '#d79a3b', cream: '#fff0c8', top: 'nuts' } },
  { n: 'Golden Pineapple Cake', p: 549, r: 4.9, rv: '1.9K', f: ['fruit', 'egg'], a: { sponge: '#fbe6a6', frost: '#fffaf0', cream: '#fff', top: 'pineapple', drip: false } },
  { n: 'Cookie Crumb Truffle Cake', p: 549, r: 4.9, rv: '1.7K', f: ['choc'], a: { sponge: '#5a3424', frost: '#33201a', top: 'oreo' } },
  { n: 'Rose & Pistachio Cream Cake', p: 699, o: 799, off: 13, r: 4.8, rv: '613', f: ['premium'], a: { sponge: '#f5e3b3', frost: '#fff4e0', cream: '#cfe3a0', top: 'petals', drip: false } },
  { n: 'Half & Half Cake', p: 549, r: 4.9, rv: '1.1K', f: ['choc', 'egg'], a: { sponge: '#8a5a3a', frost: '#f5e6c8', cream: '#4a2c20', top: 'berries' } },
  { n: 'Cherry Forest Cake', p: 599, r: 4.9, rv: '4.3K', f: ['choc', 'fruit'], a: { sponge: '#4b2a1e', frost: '#fbf3e4', cream: '#e6ccd0', top: 'cherry', drip: false } },
  { n: 'Wafer Crown Truffle Cake', p: 749, r: 4.9, rv: '2.8K', f: ['choc', 'premium'], a: { sponge: '#5d3223', frost: '#3a2018', top: 'kitkat' } },
  { n: 'Velvet Heart Cake', p: 849, r: 4.8, rv: '980', f: ['premium'], a: { sponge: '#a3232f', frost: '#fdf0e2', cream: '#fff', top: 'roses', drip: false } },
  { n: 'Blueberry Cream Tart Cake', p: 799, o: 899, off: 11, r: 4.9, rv: '1.4K', f: ['fruit', 'premium'], a: { sponge: '#efd9a8', frost: '#3d4a9a', cream: '#fff6dd', top: 'berries', layers: 1 } },
  { n: 'Dark Ganache Cake', p: 699, r: 4.9, rv: '3.6K', f: ['choc', 'premium'], a: { sponge: '#3f2217', frost: '#241410', cream: '#6d4631', top: 'berries', layers: 3 } },
];
const grid = document.getElementById('grid');
grid.innerHTML = P.map((c, i) => `
  <article class="card" data-f="${c.f.join(' ')}">
    ${c.tag ? `<span class="tag">${c.tag}</span>` : c.f.includes('egg') ? `<span class="tag g">Eggless</span>` : ''}
    <div class="art">${c.img ? `<img src="${c.img}" alt="${c.n}" loading="lazy">` : cakeSVG(c.a)}</div>
    <div class="info"><h3>${c.n}</h3>
      <div class="price"><b>₹${c.p}</b>${c.o ? `` : ''}</div>
      <button class="add" data-i="${i}">Add to Cart</button></div>
  </article>`).join('');

/* categories */
const cats = [['Classic', 'Cakes', '#f3d9b0', { sponge: '#6b3f2a', frost: '#4a2c20', top: 'cherry' }], ['Bento', 'Cakes', '#fbd0d6', { sponge: '#f3c3cd', frost: '#fff', cream: '#fff', top: 'petals', layers: 1, drip: false }],
  ['Designer', 'Cakes', '#d8e6f5', { sponge: '#cfe0f5', frost: '#fff', top: 'roses', drip: false }], ['Desserts', '& Jars', '#f2e0c2', { sponge: '#efd9a8', frost: '#6b3f2a', top: 'oreo', layers: 1 }],
  ['Gourmet', 'Cakes', '#e8d3c3', { sponge: '#3f2217', frost: '#241410', top: 'berries', layers: 3 }], ['Photo', 'Cakes', '#f9e7a8', { sponge: '#fbe6a6', frost: '#fffaf0', top: 'none', drip: false }],
  ['Same Day', 'Pickup', '#fcd9c4', { sponge: '#e0b46a', frost: '#d79a3b', top: 'nuts' }], ['Kids', 'Cakes', '#d9ecd3', { sponge: '#a6e0b4', frost: '#fff', top: 'oreo', drip: false }]];
document.getElementById('cats').innerHTML = cats.map(c => `<a class="cat" href="#bestsellers"><div class="ring" style="background:${c[2]}">${cakeSVG(c[3])}</div><small>${c[1]}</small><b>${c[0]}</b></a>`).join('');

/* occasions */
const occ = [['Birthday', 'Classic & bold', 'linear-gradient(135deg,#e8704a,#c8454d)', '🎂'], ['Anniversary', 'Romantic picks', 'linear-gradient(135deg,#a8324c,#6d1f37)', '♥'], ['Baby Birthday', 'Kids favourites', 'linear-gradient(135deg,#4aa3a0,#2a6f78)', '★'],
  ['Bride To Be', 'Pretty & pink', 'linear-gradient(135deg,#e07a9a,#b24a74)', '✿'], ['For Mom', 'Made with love', 'linear-gradient(135deg,#d39a3a,#a86a1c)', '♡'], ['For Him', 'Rich & bold', 'linear-gradient(135deg,#4a5a7a,#27324f)', '◆'],
  ['Congratulations', 'Celebrate wins', 'linear-gradient(135deg,#6a9a3a,#3f6a24)', '✓'], ['Festive', 'Christmas & more', 'linear-gradient(135deg,#8a3a3a,#4a1f1f)', '❄']];
document.getElementById('occ').innerHTML = occ.map(o => `<a href="#bestsellers" style="background:${o[2]}" data-e="${o[3]}"><b>${o[0]}</b><small>${o[1]}</small></a>`).join('');

/* reviews + cities */
document.getElementById('cityList').innerHTML = ['Bangalore', 'Delhi', 'Hyderabad', 'Mumbai', 'Noida', 'Chennai', 'Gurgaon', 'Pune', 'Jaipur', 'Chandigarh'].map(c => `<a href="#">Cakes to ${c}</a>`).join('');

/* filter chips */
document.getElementById('chips').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  document.querySelectorAll('#chips button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('.card').forEach(c => c.style.display = b.dataset.f === 'all' || c.dataset.f.includes(b.dataset.f) ? '' : 'none');
});

/* cart */
let count = 0; const toast = document.getElementById('toast');
grid.addEventListener('click', e => {
  const b = e.target.closest('.add'); if (!b) return;
  document.getElementById('cartCount').textContent = ++count;
  b.classList.add('done'); b.textContent = 'Added ✓'; setTimeout(() => { b.classList.remove('done'); b.textContent = 'Add to Cart'; }, 1600);
  toast.textContent = P[b.dataset.i].n + ' added to cart'; toast.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('on'), 2000);
});
