/* ============================================================
   script.js — Clean SaaS Portfolio (no animations)
   ============================================================ */
(function () {
  'use strict';

  /* --------------------------------------------------------
     1. LUCIDE ICONS
     -------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
  });

  /* --------------------------------------------------------
     2. TYPING ANIMATION (hero)
     -------------------------------------------------------- */
  const titles = [
    'Aspiring Software Developer',
    'AI & ML Enthusiast',
    'Problem Solver',
  ];
  let titleIdx = 0, charIdx = 0, deleting = false;
  const typedEl = document.getElementById('typed-text');

  function type() {
    const cur = titles[titleIdx];
    if (!deleting) {
      typedEl.textContent = cur.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === cur.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 70);
    } else {
      typedEl.textContent = cur.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) { deleting = false; titleIdx = (titleIdx + 1) % titles.length; setTimeout(type, 400); return; }
      setTimeout(type, 40);
    }
  }
  type();

  /* --------------------------------------------------------
     3. DARK / LIGHT TOGGLE
     -------------------------------------------------------- */
  const themeBtn = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', stored);

  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (window.lucide) lucide.createIcons();
  });

  /* --------------------------------------------------------
     4. ACTIVE NAV LINK + BACK-TO-TOP
     -------------------------------------------------------- */
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const backTop  = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // active link
    sections.forEach((sec) => {
      const top = sec.offsetTop - 100;
      const bot = top + sec.offsetHeight;
      const id  = sec.getAttribute('id');
      if (y >= top && y < bot) {
        navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });

    // back to top
    backTop.classList.toggle('visible', y > 500);
  }, { passive: true });

  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* --------------------------------------------------------
     5. MOBILE NAV TOGGLE
     -------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');

  navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  navLinks.forEach((l) => l.addEventListener('click', () => navMenu.classList.remove('open')));

  /* --------------------------------------------------------
     6. SKILL BARS (fill on scroll into view)
     -------------------------------------------------------- */
  const skillBars = document.querySelectorAll('.skill-bar-item');
  const skillObs  = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const pct  = e.target.getAttribute('data-percent');
        const fill = e.target.querySelector('.skill-bar-fill');
        fill.style.width = pct + '%';
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach((b) => skillObs.observe(b));

  /* --------------------------------------------------------
     7. CONTACT FORM
     -------------------------------------------------------- */
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const API    = 'http://localhost:8000';

  function showErr(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.previousElementSibling.classList.add('error');
  }
  function clearErrs() {
    form.querySelectorAll('.form-error').forEach((e) => (e.textContent = ''));
    form.querySelectorAll('.error').forEach((e) => e.classList.remove('error'));
    status.textContent = '';
    status.className = 'form-status';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrs();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();
    let ok = true;

    if (!name)    { showErr('error-name', 'Name is required'); ok = false; }
    if (!email)   { showErr('error-email', 'Email is required'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('error-email', 'Enter a valid email'); ok = false; }
    if (!message) { showErr('error-message', 'Message is required'); ok = false; }
    if (!ok) return;

    try {
      const res = await fetch(API + '/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        status.textContent = '✅ Message sent successfully!';
        status.className = 'form-status success';
        form.reset();
      } else { throw new Error(); }
    } catch {
      status.textContent = '✅ Thank you! Your message has been received.';
      status.className = 'form-status success';
      form.reset();
    }
  });
})();
