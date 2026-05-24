'use strict';
/* ════════════════════════════════════════
   PÉPITE JACMEL — admin.js
   Login · Galerie CRUD · Match Config
   Hero Slides · Stats · localStorage
════════════════════════════════════════ */

const ADMIN_PASSWORD = 'PepiteJacmel2026';
const LS = {
  pepites:    'pj_admin_pepites',
  match:      'pj_admin_match',
  heroSlides: 'pj_admin_hero',
  votes:      'pj_votes',
};

/* ════════════
   STATE
════════════ */
let pepites    = [];
let heroSlides = [];
let matchData  = {};
let imgBase64  = '';
let editImgBase64 = '';

/* ════════════
   LOGIN
════════════ */
function doLogin() {
  const val = document.getElementById('pw-input').value;
  const err = document.getElementById('login-error');
  if (val === ADMIN_PASSWORD) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display  = 'flex';
    loadAllData();
  } else {
    err.classList.add('show');
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-input').focus();
    setTimeout(() => err.classList.remove('show'), 3000);
  }
}

function doLogout() {
  document.getElementById('admin-panel').style.display  = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('pw-input').value = '';
}

function togglePw() {
  const inp = document.getElementById('pw-input');
  const eye = document.getElementById('pw-eye');
  if (inp.type === 'password') { inp.type = 'text'; eye.textContent = '🙈'; }
  else                         { inp.type = 'password'; eye.textContent = '👁'; }
}

/* ════════════
   SIDEBAR / TABS
════════════ */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function showTab(name, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.s-nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  btn.classList.add('active');

  const titles = { galerie:'🖼️ Galerie Pépites', match:'🏆 Match Beauté', hero:'🌟 Hero Slider', stats:'📊 Statistiques' };
  document.getElementById('topbar-title').textContent = titles[name] || '';

  if (name === 'stats') refreshStats();
  if (name === 'match') loadMatchUI();
  if (name === 'hero')  renderHeroSlides();

  if (window.innerWidth <= 860) document.getElementById('sidebar').classList.remove('open');
}

/* ════════════
   LOAD DATA
════════════ */
function loadAllData() {
  pepites    = JSON.parse(localStorage.getItem(LS.pepites)    || '[]');
  heroSlides = JSON.parse(localStorage.getItem(LS.heroSlides) || '[]');
  matchData  = JSON.parse(localStorage.getItem(LS.match)      || '{}');
  renderPepitesList();
  renderHeroSlides();
  loadMatchUI();
  syncWithMainSite();
}

/* Save pepites to main site key too */
function syncWithMainSite() {
  localStorage.setItem('pj_pepites_live', JSON.stringify(pepites));
  localStorage.setItem('pj_hero_live',    JSON.stringify(heroSlides));
  localStorage.setItem('pj_match_live',   JSON.stringify(matchData));
}

/* ════════════
   IMAGE PREVIEW
════════════ */
function previewImg(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('⚠️ Image trop lourde — max 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    imgBase64 = e.target.result;
    const preview = document.getElementById('img-preview');
    const inner   = document.getElementById('upload-inner');
    preview.src = imgBase64;
    preview.style.display = 'block';
    inner.style.display   = 'none';
  };
  reader.readAsDataURL(file);
}

function previewMatchImg(input, side) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    const preview = document.getElementById('match-preview-' + side);
    const inner   = document.getElementById('match-upload-inner-' + side);
    preview.src = data;
    preview.style.display = 'block';
    inner.style.display   = 'none';
    if (side === 'a') matchData.imgA = data;
    else              matchData.imgB = data;
  };
  reader.readAsDataURL(file);
}

function previewEditImg(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    editImgBase64 = e.target.result;
    const preview = document.getElementById('edit-img-preview');
    const inner   = document.getElementById('edit-upload-inner');
    preview.src = editImgBase64;
    preview.style.display = 'block';
    inner.style.display   = 'none';
  };
  reader.readAsDataURL(file);
}

/* ════════════
   ADD PÉPITE
════════════ */
function addPepite() {
  const name = document.getElementById('add-name').value.trim();
  const loc  = document.getElementById('add-loc').value.trim();
  const cat  = document.getElementById('add-cat').value;

  if (!name) { toast('⚠️ Entrez le nom de la pépite'); return; }
  if (!loc)  { toast('⚠️ Entrez la localité'); return; }
  if (!imgBase64) { toast('⚠️ Choisissez une photo'); return; }

  const newPepite = {
    id:   Date.now(),
    name, loc, cat,
    img:  imgBase64,
    date: new Date().toLocaleDateString('fr-FR')
  };

  pepites.unshift(newPepite);
  localStorage.setItem(LS.pepites, JSON.stringify(pepites));
  syncWithMainSite();

  renderPepitesList();
  clearForm();
  toast('✅ Pépite ajoutée avec succès !');
}

/* ════════════
   RENDER LIST
════════════ */
function renderPepitesList(filter = '') {
  const list  = document.getElementById('pepites-list');
  const empty = document.getElementById('empty-state');
  const count = document.getElementById('total-count');

  const filtered = filter
    ? pepites.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.loc.toLowerCase().includes(filter.toLowerCase()))
    : pepites;

  count.textContent = pepites.length + ' pépite' + (pepites.length !== 1 ? 's' : '');

  if (filtered.length === 0) {
    list.innerHTML = '';
    list.appendChild(empty || createEmptyState());
    empty && (empty.style.display = '');
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = filtered.map(p => `
    <div class="pepite-row" id="row-${p.id}">
      <img class="pepite-row__thumb" src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/52x68/1a1a1a/C9A84C?text=PJ'"/>
      <div class="pepite-row__info">
        <div class="pepite-row__name">${escHtml(p.name)}</div>
        <div class="pepite-row__loc">📍 ${escHtml(p.loc)}</div>
        <span class="pepite-row__cat cat-${p.cat}">${catLabel(p.cat)}</span>
      </div>
      <div class="pepite-row__actions">
        <button class="row-btn row-btn--edit" title="Modifier" onclick="openEditModal(${p.id})">✏️</button>
        <button class="row-btn row-btn--del"  title="Supprimer" onclick="deletePepite(${p.id})">🗑</button>
      </div>
    </div>
  `).join('');
}

function catLabel(cat) {
  return { beaute:'💄 Beauté', ambiance:'🌴 Ambiance', fun:'🎉 Fun' }[cat] || cat;
}

function filterAdmin(val) {
  renderPepitesList(val);
}

/* ════════════
   DELETE
════════════ */
function deletePepite(id) {
  if (!confirm('Supprimer cette pépite ?')) return;
  pepites = pepites.filter(p => p.id !== id);
  localStorage.setItem(LS.pepites, JSON.stringify(pepites));
  syncWithMainSite();
  renderPepitesList();
  toast('🗑 Pépite supprimée');
}

function clearAllPepites() {
  if (!confirm('Effacer TOUTES les pépites ? Cette action est irréversible.')) return;
  pepites = [];
  localStorage.setItem(LS.pepites, JSON.stringify(pepites));
  syncWithMainSite();
  renderPepitesList();
  toast('🗑 Galerie vidée');
}

/* ════════════
   EDIT MODAL
════════════ */
function openEditModal(id) {
  const p = pepites.find(x => x.id === id);
  if (!p) return;
  document.getElementById('edit-id').value   = id;
  document.getElementById('edit-name').value = p.name;
  document.getElementById('edit-loc').value  = p.loc;
  document.getElementById('edit-cat').value  = p.cat;
  document.getElementById('edit-img-preview').style.display = 'none';
  document.getElementById('edit-upload-inner').style.display = '';
  editImgBase64 = '';
  document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal(e) {
  if (e.target === document.getElementById('edit-modal'))
    document.getElementById('edit-modal').classList.remove('active');
}

function saveEdit() {
  const id   = parseInt(document.getElementById('edit-id').value);
  const name = document.getElementById('edit-name').value.trim();
  const loc  = document.getElementById('edit-loc').value.trim();
  const cat  = document.getElementById('edit-cat').value;
  if (!name || !loc) { toast('⚠️ Remplissez tous les champs'); return; }

  const idx = pepites.findIndex(p => p.id === id);
  if (idx === -1) return;
  pepites[idx].name = name;
  pepites[idx].loc  = loc;
  pepites[idx].cat  = cat;
  if (editImgBase64) pepites[idx].img = editImgBase64;

  localStorage.setItem(LS.pepites, JSON.stringify(pepites));
  syncWithMainSite();
  renderPepitesList();
  document.getElementById('edit-modal').classList.remove('active');
  toast('✅ Pépite modifiée !');
}

/* ════════════
   CLEAR FORM
════════════ */
function clearForm() {
  document.getElementById('add-name').value = '';
  document.getElementById('add-loc').value  = '';
  document.getElementById('add-cat').value  = 'beaute';
  document.getElementById('img-preview').style.display  = 'none';
  document.getElementById('upload-inner').style.display = '';
  document.getElementById('add-img').value = '';
  imgBase64 = '';
}

/* ════════════
   MATCH BEAUTÉ
════════════ */
function loadMatchUI() {
  const md = JSON.parse(localStorage.getItem(LS.match) || '{}');
  if (md.nameA) document.getElementById('match-name-a').value = md.nameA;
  if (md.locA)  document.getElementById('match-loc-a').value  = md.locA;
  if (md.nameB) document.getElementById('match-name-b').value = md.nameB;
  if (md.locB)  document.getElementById('match-loc-b').value  = md.locB;
  if (md.imgA)  { document.getElementById('match-preview-a').src = md.imgA; document.getElementById('match-preview-a').style.display = 'block'; document.getElementById('match-upload-inner-a').style.display = 'none'; }
  if (md.imgB)  { document.getElementById('match-preview-b').src = md.imgB; document.getElementById('match-preview-b').style.display = 'block'; document.getElementById('match-upload-inner-b').style.display = 'none'; }

  const votes = JSON.parse(localStorage.getItem(LS.votes) || '{"a":0,"b":0}');
  updateMatchStats(votes.a || 0, votes.b || 0);
}

function saveMatch() {
  matchData.nameA = document.getElementById('match-name-a').value.trim() || 'Pépite A';
  matchData.locA  = document.getElementById('match-loc-a').value.trim()  || 'Jacmel';
  matchData.nameB = document.getElementById('match-name-b').value.trim() || 'Pépite B';
  matchData.locB  = document.getElementById('match-loc-b').value.trim()  || 'Jacmel';
  localStorage.setItem(LS.match, JSON.stringify(matchData));
  syncWithMainSite();
  toast('✅ Match sauvegardé ! Visible sur le site.');
}

function resetVotes() {
  if (!confirm('Réinitialiser tous les votes ?')) return;
  localStorage.removeItem(LS.votes);
  localStorage.removeItem('pj_voted');
  updateMatchStats(0, 0);
  toast('🔄 Votes réinitialisés !');
}

function updateMatchStats(a, b) {
  const total = a + b || 1;
  const pctA  = Math.round((a / total) * 100);
  const pctB  = 100 - pctA;
  const msA   = document.getElementById('ms-votes-a');
  const msB   = document.getElementById('ms-votes-b');
  const barA  = document.getElementById('ms-bar-a');
  const barB  = document.getElementById('ms-bar-b');
  if (msA) msA.textContent = a + ' votes A (' + pctA + '%)';
  if (msB) msB.textContent = b + ' votes B (' + pctB + '%)';
  if (barA) barA.style.width = pctA + '%';
  if (barB) barB.style.width = pctB + '%';
}

/* ════════════
   HERO SLIDES
════════════ */
function addHeroSlide(input) {
  const file = input.files[0];
  if (!file) return;
  if (heroSlides.length >= 6) { toast('⚠️ Maximum 6 slides'); return; }
  if (file.size > 5 * 1024 * 1024) { toast('⚠️ Image trop lourde — max 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    heroSlides.push({ id: Date.now(), src: e.target.result });
    localStorage.setItem(LS.heroSlides, JSON.stringify(heroSlides));
    syncWithMainSite();
    renderHeroSlides();
    input.value = '';
    toast('✅ Slide ajoutée !');
  };
  reader.readAsDataURL(file);
}

function renderHeroSlides() {
  const grid  = document.getElementById('hero-slides-grid');
  const count = document.getElementById('hero-count');
  if (!grid) return;
  count.textContent = heroSlides.length + ' / 6 slides';
  grid.innerHTML = heroSlides.map((s, i) => `
    <div class="hero-slide-card">
      <img src="${s.src}" alt="Slide ${i+1}"/>
      <button class="hero-slide-card__del" onclick="deleteHeroSlide(${s.id})" title="Supprimer">✕</button>
      <div class="hero-slide-card__num">Slide ${i+1}</div>
    </div>
  `).join('') || '<p style="color:var(--gray-md);font-size:0.85rem;padding:8px 0">Aucune slide. Ajoutez-en une ci-dessous.</p>';
}

function deleteHeroSlide(id) {
  heroSlides = heroSlides.filter(s => s.id !== id);
  localStorage.setItem(LS.heroSlides, JSON.stringify(heroSlides));
  syncWithMainSite();
  renderHeroSlides();
  toast('🗑 Slide supprimée');
}

/* ════════════
   STATS
════════════ */
function refreshStats() {
  const votes = JSON.parse(localStorage.getItem(LS.votes) || '{"a":0,"b":0}');
  const totalVotes = (votes.a || 0) + (votes.b || 0);
  const winner = !totalVotes ? '—' : votes.a > votes.b ? (matchData.nameA || 'Pépite A') : votes.b > votes.a ? (matchData.nameB || 'Pépite B') : 'Égalité';

  set('s-total-pepites', pepites.length);
  set('s-total-votes',   totalVotes);
  set('s-winner',        winner);
  set('s-slides',        heroSlides.length);

  // Cat stats
  const cats = { beaute: 0, ambiance: 0, fun: 0 };
  pepites.forEach(p => cats[p.cat] = (cats[p.cat] || 0) + 1);
  const max = Math.max(...Object.values(cats), 1);
  const colors = { beaute:'var(--rose)', ambiance:'var(--gold)', fun:'#81c784' };
  const labels = { beaute:'💄 Beauté', ambiance:'🌴 Ambiance', fun:'🎉 Fun' };
  document.getElementById('cat-stats').innerHTML = Object.entries(cats).map(([k, v]) => `
    <div class="cat-stat-row">
      <label>${labels[k]}</label>
      <div class="cat-stat-bar"><div class="cat-stat-bar__fill" style="width:${Math.round((v/max)*100)}%;background:${colors[k]}"></div></div>
      <span>${v}</span>
    </div>
  `).join('');
}

function resetAllData() {
  if (!confirm('⚠️ Effacer TOUTES les données ? Galerie, match, slides, votes ?')) return;
  [LS.pepites, LS.match, LS.heroSlides, LS.votes, 'pj_voted', 'pj_pepites_live', 'pj_hero_live', 'pj_match_live'].forEach(k => localStorage.removeItem(k));
  pepites = []; heroSlides = []; matchData = {};
  renderPepitesList(); renderHeroSlides(); loadMatchUI();
  toast('🗑 Toutes les données effacées');
}

/* ════════════
   UTILS
════════════ */
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function toast(msg) {
  const t = document.getElementById('admin-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* Enter key on login */
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('pw-input');
  if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
});
