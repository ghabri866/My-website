'use strict';
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Preloader */
window.addEventListener('load', () => setTimeout(() => $('#preloader').classList.add('hide'), 500));

/* ===== Langue FR / AR ===== */
const WORDS = {
  fr: ['Étudiant en Informatique de Gestion', 'Passionné de développement web', 'Data & Business Intelligence', 'Robotique & programmation'],
  ar: ['طالب في إعلامية التصرف', 'شغوف بتطوير الويب', 'تحليل البيانات وذكاء الأعمال', 'الروبوتيك والبرمجة']
};
const MSG = {
  fr: { soon: '⚠️ Le formulaire fonctionnera après ajout de l\'identifiant Formspree.', sending: 'Envoi en cours...', ok: '✅ Message envoyé, merci !', err: '❌ Une erreur est survenue, réessayez.' },
  ar: { soon: '⚠️ الفورم باش يخدم بعد ما نحطو معرّف Formspree.', sending: 'جاري الإرسال...', ok: '✅ توصلت رسالتك، شكرا!', err: '❌ صار مشكل، عاود حاول.' }
};
let lang = localStorage.getItem('lang') || 'fr';
let wi = 0, ci = 0, del = false;

function applyLang() {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-ar]').forEach(el => {
    if (el.dataset.fr === undefined) el.dataset.fr = el.textContent.trim();
    el.textContent = el.dataset[lang];
  });
  $$('[data-ar-ph]').forEach(el => {
    if (el.dataset.frPh === undefined) el.dataset.frPh = el.placeholder;
    el.placeholder = lang === 'ar' ? el.dataset.arPh : el.dataset.frPh;
  });
  $('#langBtn').textContent = lang === 'fr' ? 'عربي' : 'FR';
  wi = 0; ci = 0; del = false;
}
$('#langBtn').addEventListener('click', () => {
  lang = lang === 'fr' ? 'ar' : 'fr';
  localStorage.setItem('lang', lang);
  applyLang();
});
applyLang();

/* Thème */
const root = document.documentElement, themeBtn = $('#themeBtn');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;
const syncIcon = () => themeBtn.textContent = root.dataset.theme === 'dark' ? '🌙' : '☀️';
syncIcon();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
  syncIcon();
});

/* Menu mobile */
const menu = $('#menu');
$('#burger').addEventListener('click', () => menu.classList.toggle('open'));
$$('#menu a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

/* Scroll : navbar, progression, retour en haut, lien actif */
const nav = $('#nav'), progress = $('#progress'), toTop = $('#toTop');
const sections = $$('section[id]'), links = $$('#menu a');
function onScroll() {
  const y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
  nav.classList.toggle('scrolled', y > 50);
  progress.style.width = (y / h * 100) + '%';
  toTop.classList.toggle('show', y > 500);
  let current = 'home';
  sections.forEach(s => { if (y >= s.offsetTop - 200) current = s.id; });
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* Effet machine à écrire */
const typed = $('#typed');
(function type() {
  const w = WORDS[lang][wi % WORDS[lang].length];
  typed.textContent = w.slice(0, del ? --ci : ++ci);
  let delay = del ? 40 : 90;
  if (!del && ci >= w.length) { del = true; delay = 1600; }
  else if (del && ci <= 0) { del = false; wi = (wi + 1) % WORDS[lang].length; delay = 400; }
  setTimeout(type, delay);
})();

/* Apparition au scroll + compteurs + barres */
function animateCount(el) {
  const to = +el.dataset.to, suffix = el.dataset.suffix || ''; let n = 0;
  const step = Math.max(1, Math.ceil(to / 40));
  const t = setInterval(() => { n = Math.min(to, n + step); el.textContent = n + (n >= to ? suffix : ''); if (n >= to) clearInterval(t); }, 60);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    $$('.count', el).forEach(animateCount);
    $$('.bar i', el).forEach(b => b.style.width = b.dataset.w + '%');
    io.unobserve(el);
  });
}, { threshold: .15 });
$$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });

/* Inclinaison 3D des cartes */
$$('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

/* Lueur du curseur */
const glow = $('#cursorGlow');
addEventListener('mousemove', e => { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

/* Particules */
const cv = $('#particles'), ctx = cv.getContext('2d');
let W, H, pts = [];
function resize() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  pts = Array.from({ length: Math.min(70, Math.floor(W / 20)) }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 2 + 1
  }));
}
resize(); addEventListener('resize', resize);
(function draw() {
  ctx.clearRect(0, 0, W, H);
  const dark = root.dataset.theme === 'dark';
  ctx.fillStyle = dark ? 'rgba(0,212,255,.6)' : 'rgba(108,92,231,.5)';
  pts.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 120) {
        ctx.strokeStyle = (dark ? 'rgba(108,92,231,' : 'rgba(0,150,200,') + (1 - d / 120) * .25 + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    }
  });
  requestAnimationFrame(draw);
})();

/* Formulaire (Formspree) */
const form = $('#contactForm'), msg = $('#formMsg');
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (form.action.includes('YOUR_FORM_ID')) { msg.textContent = MSG[lang].soon; return; }
  msg.textContent = MSG[lang].sending;
  try {
    const r = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    if (r.ok) { msg.textContent = MSG[lang].ok; form.reset(); } else throw 0;
  } catch { msg.textContent = MSG[lang].err; }
});

$('#year').textContent = new Date().getFullYear();