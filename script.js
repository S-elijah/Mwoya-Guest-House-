/* Mwoya Guest House — small, dependency-free enhancements */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- mobile nav ---- */
  var toggle = $('.menu-toggle'), nav = $('.main-nav');
  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
    window.matchMedia('(min-width:861px)').addEventListener('change', function () { setNav(false); });
  }

  /* ---- header shadow + back-to-top ---- */
  var header = $('.site-header'), topBtn = $('.fab-top');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (topBtn) topBtn.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---- reveal on scroll ---- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- hero slideshow ---- */
  var slides = $$('.hero-slides img'), dots = $$('.hero-dots button'), idx = 0, timer;
  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('active', n === idx); });
    dots.forEach(function (d, n) { d.classList.toggle('active', n === idx); d.setAttribute('aria-current', n === idx); });
  }
  function play() {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer); timer = setInterval(function () { show(idx + 1); }, 6000);
  }
  if (slides.length) {
    show(0); play();
    dots.forEach(function (d, n) { d.addEventListener('click', function () { show(n); play(); }); });
    document.addEventListener('visibilitychange', function () { document.hidden ? clearInterval(timer) : play(); });
  }

  /* ---- bar open / closed (Africa/Kampala, 4 PM – midnight daily) ---- */
  var badge = $('#bar-status');
  if (badge) {
    var hr = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Kampala' }).format(new Date()), 10) % 24;
    var open = hr >= 16;
    badge.classList.toggle('open', open);
    $('.status-text', badge).textContent = open ? 'The Oak & Ember is open now · until midnight' : 'The Oak & Ember opens today at 4 PM';
  }

  /* ---- gallery: filters + lightbox ---- */
  var items = $$('.gallery-item');
  var filters = $$('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === f); });
      var cat = f.dataset.filter;
      items.forEach(function (it) { it.classList.toggle('hide', cat !== 'all' && it.dataset.cat !== cat); });
    });
  });

  var dtabs = $$('.drink-tab');
  dtabs.forEach(function (t) {
    t.addEventListener('click', function () {
      dtabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t); });
      var k = t.dataset.drinks, box = $('.drink-groups');
      $$('.drink-group').forEach(function (g) { g.classList.toggle('hide', k !== 'all' && g.dataset.group !== k); });
      if (box) box.classList.toggle('single', k !== 'all');
    });
  });

  var lb = $('.lightbox');
  if (lb) {
    var lbImg = $('img', lb), lbCap = $('figcaption', lb), current = 0, list = [], lastFocus;
    var visible = function () { return $$('[data-lightbox]').filter(function (i) { return !i.classList.contains('hide'); }); };
    function render() {
      var it = list[current];
      lbImg.src = it.dataset.full || $('img', it).src;
      lbImg.alt = $('img', it) ? $('img', it).alt : '';
      lbCap.textContent = it.dataset.caption || '';
      var multi = list.length > 1;
      $('.lb-prev', lb).hidden = $('.lb-next', lb).hidden = !multi;
    }
    function openLb(it) {
      list = it.hasAttribute('data-single') ? [it] : visible();
      current = list.indexOf(it); lastFocus = document.activeElement;
      render(); lb.classList.add('open'); document.body.style.overflow = 'hidden';
      $('.lb-close', lb).focus();
    }
    function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    function step(d) { current = (current + d + list.length) % list.length; render(); }
    $$('[data-lightbox]').forEach(function (it) { it.addEventListener('click', function () { openLb(it); }); });
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function () { step(-1); });
    $('.lb-next', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50 && list.length > 1) step(dx < 0 ? 1 : -1);
    });
  }

  /* ---- footer year ---- */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();
