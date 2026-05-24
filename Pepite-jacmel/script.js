'use strict';

/* ════════════════════════════════════════
   PÉPITE JACMEL — script.js
   Cursor · Navbar · Hero Slideshow · Petals
   Counter · Galerie Filter · Match Vote · Toast
════════════════════════════════════════ */

/* ── GALERIE DATA ── */
const PEPITES = [
  { id:1, name:"Pépite Soleil",    loc:"Jacmel Centre",  cat:"beaute",   img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80" },
  { id:2, name:"Pépite Étoile",   loc:"Cayes-Jacmel",   cat:"ambiance", img:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80" },
  { id:3, name:"Pépite Rose",      loc:"La Vallée",      cat:"fun",      img:"https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=500&q=80" },
  { id:4, name:"Pépite Diamant",   loc:"Jacmel Plage",   cat:"beaute",   img:"https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&q=80" },
  { id:5, name:"Pépite Lumière",   loc:"Marigot",        cat:"ambiance", img:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&q=80" },
  { id:6, name:"Pépite Fleur",     loc:"Jacmel Centre",  cat:"fun",      img:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80" },
  { id:7, name:"Pépite Reine",     loc:"Côte-de-Fer",   cat:"beaute",   img:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80" },
  { id:8, name:"Pépite Chérie",    loc:"Jacmel Plage",   cat:"ambiance", img:"https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=500&q=80" },
];

/* ════════════════════
   INIT
════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavbar();
  initHeroSlideshow();
  initPetals();
  initCounters();
  buildGalerie();
  initVoteSystem();
  initScrollReveal();
});

/* ════════════════════
   CURSOR GLOW
════════════════════ */
function initCursor() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || window.innerWidth < 900) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

/* ════════════════════
   NAVBAR
════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}

function toggleMenu() {
  const menu   = document.getElementById('mobile-menu');
  const burger = document.getElementById('burger');
  const isOpen = menu.classList.toggle('open');
  burger.style.opacity = isOpen ? '0.6' : '1';
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

/* ════════════════════
   HERO SLIDESHOW
════════════════════ */
function initHeroSlideshow() {
  const slides    = document.querySelectorAll('.hero__slide');
  const dotsWrap  = document.getElementById('hero-dots');
  if (!slides.length || !dotsWrap) return;

  let current = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToSlide(i);
    dotsWrap.appendChild(dot);
  });

  function goToSlide(idx) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
  }

  setInterval(() => {
    goToSlide((current + 1) % slides.length);
  }, 5000);
}

/* ════════════════════
   PETALS ANIMATION
════════════════════ */
function initPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  const emojis = ['🌸', '🌺', '✨', '💗', '🌹'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const size  = Math.random() * 0.8 + 0.6;
    const left  = Math.random() * 100;
    const delay = Math.random() * 14;
    const dur   = Math.random() * 8 + 10;
    p.style.cssText = `
      left:${left}%;
      font-size:${size}rem;
      animation-delay:${delay}s;
      animation-duration:${dur}s;
    `;
    container.appendChild(p);
  }
}

/* ════════════════════
   ANIMATED COUNTERS
════════════════════ */
function initCounters() {
  const nums = document.querySelectorAll('.stat__num[data-target]');
  if (!nums.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      let current  = 0;
      const step   = Math.ceil(target / 40);
      const timer  = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + (el.dataset.suffix || '');
        if (current >= target) clearInterval(timer);
      }, 40);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => observer.observe(n));
}

/* ════════════════════
   GALERIE
════════════════════ */
function buildGalerie() {
  const grid = document.getElementById('galerie-grid');
  if (!grid) return;
  PEPITES.forEach(p => grid.appendChild(createGCard(p)));
}

function createGCard(p) {
  const card = document.createElement('div');
  card.className = 'g-card';
  card.dataset.cat = p.cat;

  const catLabels = { beaute: '💄 Beauté', ambiance: '🌴 Ambiance', fun: '🎉 Fun' };

  card.innerHTML = `
    <img src="${p.img}" alt="${p.name}" loading="lazy"
         onerror="this.src='https://via.placeholder.com/400x533/161616/C9A84C?text=${encodeURIComponent(p.name)}'"/>
    <div class="g-card__tag">${catLabels[p.cat] || p.cat}</div>
    <div class="g-card__overlay">
      <div class="g-card__name">${p.name}</div>
      <div class="g-card__loc">📍 ${p.loc}</div>
      <div class="g-card__actions">
        <div class="g-card__btn" title="J'aime" onclick="likeCard(this)">❤️</div>
        <div class="g-card__btn" title="Partager" onclick="shareCard('${p.name}')">📤</div>
        <a href="https://whatsapp.com/channel/0029Vb8CmyVGufInuMu9D10L" target="_blank" class="g-card__btn" title="Voir sur la chaîne">🔗</a>
      </div>
    </div>
  `;
  return card;
}

function filterGalerie(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.g-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.classList.toggle('hidden', !show);
    if (show) {
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        card.style.animation = 'fadeUp 0.4s ease both';
      });
    }
  });
}

function likeCard(btn) {
  const liked = btn.dataset.liked === 'true';
  btn.textContent = liked ? '❤️' : '💖';
  btn.style.background = liked ? '' : 'rgba(255,107,157,0.4)';
  btn.dataset.liked = liked ? 'false' : 'true';
  if (!liked) showToast('💖 Ajouté à tes favoris !');
}

function shareCard(name) {
  if (navigator.share) {
    navigator.share({
      title: name + ' — Pépite Jacmel',
      text: '🌸 Regarde cette pépite sur PÉPITE JACMEL OFFICIEL !',
      url: 'https://whatsapp.com/channel/0029Vb8CmyVGufInuMu9D10L'
    });
  } else {
    navigator.clipboard?.writeText('https://whatsapp.com/channel/0029Vb8CmyVGufInuMu9D10L');
    showToast('🔗 Lien copié dans le presse-papier !');
  }
}

/* ════════════════════
   MATCH BEAUTÉ / VOTE
════════════════════ */
function initVoteSystem() {
  const stored = JSON.parse(localStorage.getItem('pj_votes') || '{"a":0,"b":0}');
  updateVoteUI(stored.a, stored.b, localStorage.getItem('pj_voted'));
}

function vote(side) {
  const alreadyVoted = localStorage.getItem('pj_voted');
  if (alreadyVoted) {
    showToast('⚠️ Tu as déjà voté pour ce match !');
    return;
  }

  const stored = JSON.parse(localStorage.getItem('pj_votes') || '{"a":0,"b":0}');
  stored[side]++;
  localStorage.setItem('pj_votes', JSON.stringify(stored));
  localStorage.setItem('pj_voted', side);

  updateVoteUI(stored.a, stored.b, side);

  const winner = side === 'a' ? 'Pépite Mystère A' : 'Pépite Mystère B';
  showToast(`❤️ Tu as voté pour ${winner} !`);

  // Animate winning card
  const winCard = document.getElementById('match-card-' + side);
  winCard.style.transform = 'translateY(-12px) scale(1.03)';
  winCard.style.borderColor = side === 'a' ? 'rgba(255,107,157,0.6)' : 'rgba(201,168,76,0.6)';
  setTimeout(() => {
    winCard.style.transform = '';
    winCard.style.borderColor = '';
  }, 800);
}

function updateVoteUI(votesA, votesB, voted) {
  const total = votesA + votesB || 1;
  const pctA  = Math.round((votesA / total) * 100);
  const pctB  = 100 - pctA;

  document.getElementById('votes-a').textContent = votesA + ' vote' + (votesA !== 1 ? 's' : '');
  document.getElementById('votes-b').textContent = votesB + ' vote' + (votesB !== 1 ? 's' : '');
  document.getElementById('bar-a').style.width = pctA + '%';
  document.getElementById('bar-b').style.width = pctB + '%';

  // Crown on winner
  const crownA = document.querySelector('#match-card-a .match-card__crown');
  const crownB = document.querySelector('#match-card-b .match-card__crown');
  if (crownA && crownB) {
    crownA.style.opacity = votesA >= votesB ? '1' : '0.2';
    crownB.style.opacity = votesB > votesA  ? '1' : '0.2';
  }

  if (voted) {
    const btnA = document.getElementById('btn-vote-a');
    const btnB = document.getElementById('btn-vote-b');
    if (btnA) { btnA.disabled = true; btnA.textContent = voted === 'a' ? '✓ Voté !' : `❤️ ${pctA}%`; }
    if (btnB) { btnB.disabled = true; btnB.textContent = voted === 'b' ? '✓ Voté !' : `❤️ ${pctB}%`; }
  }
}

/* ════════════════════
   SCROLL REVEAL
════════════════════ */
function initScrollReveal() {
  const targets = document.querySelectorAll('.section-header, .g-card, .social-card, .match-card, .join-hero');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeUp 0.6s ease both';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  targets.forEach(t => {
    t.style.opacity = '0';
    obs.observe(t);
  });
}

/* ════════════════════
   TOAST
════════════════════ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}
