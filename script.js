/* ============================================================
   reHyve — interactions
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  const bar = loader && $('.loader-bar i', loader);
  let p = 0;
  function tickLoader() {
    p = Math.min(p + Math.random() * 22 + 8, 100);
    if (bar) bar.style.width = p + '%';
    if (p < 100) setTimeout(tickLoader, 120);
  }
  if (loader && !reduce) tickLoader();
  function hideLoader() {
    if (!loader) return;
    if (bar) bar.style.width = '100%';
    setTimeout(() => loader.classList.add('done'), reduce ? 0 : 320);
  }
  window.addEventListener('load', () => setTimeout(hideLoader, reduce ? 0 : 500));
  // safety fallback
  setTimeout(hideLoader, 2600);

  /* ---------- Hero staggered fade ---------- */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function animFade(el, delay, dur) {
    if (!el) return;
    if (reduce) { el.style.opacity = 1; el.style.transform = 'none'; return; }
    el.style.opacity = 0;
    el.style.transform = 'translateY(16px)';
    setTimeout(() => {
      let start = null;
      requestAnimationFrame(function step(ts) {
        if (!start) start = ts;
        const t = Math.min((ts - start) / dur, 1);
        const e = easeOut(t);
        el.style.opacity = e;
        el.style.transform = `translateY(${16 * (1 - e)}px)`;
        if (t < 1) requestAnimationFrame(step);
        else el.style.transform = 'none';
      });
    }, delay);
  }
  const fadeEls = $$('.fade[data-fade]').sort((a, b) => a.dataset.fade - b.dataset.fade);
  fadeEls.forEach((el, i) => animFade(el, 200 + i * 130, 600));

  /* ---------- Gooey morphing text ---------- */
  (function gooey() {
    const t1 = $('#gt1'), t2 = $('#gt2');
    if (!t1 || !t2) return;
    const texts = ['Concept', 'Energy Gel', 'Loading…'];
    if (reduce) { t1.textContent = texts[0]; t1.style.opacity = 1; return; }
    const morphTime = 1.1, cooldownTime = 0.35;
    let idx = texts.length - 1, time = new Date(), morph = 0, cooldown = cooldownTime;
    t1.textContent = texts[idx % texts.length];
    t2.textContent = texts[(idx + 1) % texts.length];
    function setMorph(f) {
      t2.style.filter = `blur(${Math.min(8 / f - 8, 100)}px)`;
      t2.style.opacity = `${Math.pow(f, 0.4) * 100}%`;
      const g = 1 - f;
      t1.style.filter = `blur(${Math.min(8 / g - 8, 100)}px)`;
      t1.style.opacity = `${Math.pow(g, 0.4) * 100}%`;
    }
    function cool() { morph = 0; t2.style.filter = ''; t2.style.opacity = '100%'; t1.style.filter = ''; t1.style.opacity = '0%'; }
    function doMorph() { morph -= cooldown; cooldown = 0; let f = morph / morphTime; if (f > 1) { cooldown = cooldownTime; f = 1; } setMorph(f); }
    (function loop() {
      requestAnimationFrame(loop);
      const nt = new Date(); const inc = cooldown > 0; const dt = (nt - time) / 1000; time = nt; cooldown -= dt;
      if (cooldown <= 0) { if (inc) { idx = (idx + 1) % texts.length; t1.textContent = texts[idx % texts.length]; t2.textContent = texts[(idx + 1) % texts.length]; } doMorph(); }
      else cool();
    })();
  })();

  /* ---------- Nav: glass + hide on scroll down ---------- */
  const nav = $('#nav');
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 30);
    if (y > 400 && y > lastY + 4) nav.classList.add('hide');
    else if (y < lastY - 4 || y < 120) nav.classList.remove('hide');
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle'), menu = $('#mobileMenu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle && toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

  /* ---------- Scroll reveal + grid stagger ---------- */
  const revealEls = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in'));
  } else {
    // assign stagger delay to grid children
    $$('.bento, .quote-grid, .plans, .science-list, .badges').forEach(grid => {
      $$('.reveal', grid).forEach((el, i) => el.style.setProperty('--d', (i * 0.06) + 's'));
    });
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    if (reduce || isNaN(target)) { el.textContent = target || el.dataset.count; return; }
    const dur = 1300; let start = null;
    (function step(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      const val = Math.round(easeOut(t) * target);
      el.textContent = val;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    })(performance.now());
  }
  const counters = $$('[data-count]');
  if (counters.length) {
    if (reduce || !('IntersectionObserver' in window)) counters.forEach(countUp);
    else {
      const cio = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => { if (en.isIntersecting) { countUp(en.target); obs.unobserve(en.target); } });
      }, { threshold: 0.6 });
      counters.forEach(c => cio.observe(c));
    }
  }

  /* ---------- Flavor switcher ---------- */
  (function flavors() {
    const tabs = $$('.ftab');
    if (!tabs.length) return;
    const section = $('#flavors');
    const bg = $('#flavorPreview .fp-bg');
    const name = $('#fpName'), desc = $('#fpDesc'), idxEl = $('#fpIndex'), notes = $('#fpNotes');
    const content = $('#flavorPreview .fp-content');
    function select(tab, i) {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
      const c = tab.dataset.color, ink = tab.dataset.ink;
      bg.style.background = c;
      content.style.color = ink;
      name.textContent = tab.dataset.name;
      desc.textContent = tab.dataset.desc;
      notes.textContent = tab.dataset.notes;
      idxEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(tabs.length).padStart(2, '0');
      // subtle section tint shift toward the flavor
      if (section) section.style.background = `color-mix(in srgb, ${c} 8%, #1a1a1a)`;
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, i));
      tab.addEventListener('mouseenter', () => { if (window.matchMedia('(hover:hover)').matches) select(tab, i); });
    });
    select(tabs[0], 0);
  })();

  /* ---------- FAQ accordion (animated height, single-open) ---------- */
  $$('.faq-item').forEach(item => {
    const sum = $('summary', item), ans = $('.faq-a', item);
    sum.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = item.hasAttribute('open');
      if (!isOpen) {
        $$('.faq-item[open]').forEach(o => { if (o !== item) { o.removeAttribute('open'); $('.faq-a', o).style.maxHeight = '0px'; } });
        item.setAttribute('open', '');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      } else {
        ans.style.maxHeight = '0px';
        setTimeout(() => item.removeAttribute('open'), 380);
      }
    });
  });
  window.addEventListener('resize', () => {
    $$('.faq-item[open] .faq-a').forEach(a => { a.style.maxHeight = a.scrollHeight + 'px'; });
  });

  /* ---------- Newsletter (submits to Zoho Prelaunch list) ---------- */
  const form = $('#ctaForm'), msg = $('#ctaMsg');
  form && form.addEventListener('submit', e => {
    const input = $('#email', form);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    if (!ok) {
      e.preventDefault();
      msg.style.color = '#b04a3a';
      msg.textContent = 'Please enter a valid email address.';
      input.focus();
      return;
    }
    // valid: let the form POST to Zoho via the hidden iframe, then confirm
    msg.style.color = '#6ba292';
    msg.textContent = 'You\u2019re in \uD83C\uDF89 Check your inbox to confirm and get 10% off.';
    setTimeout(() => { form.reset(); }, 300);
  });

  /* ---------- Magnetic buttons (pointer-fine only) ---------- */
  if (!reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.magnetic').forEach(btn => {
      const strength = 14;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Spinning circular text (vanilla port of SpinningText) ---------- */
  (function spinningText() {
    const text = $('.spin-text');
    const path = $('#spinPath');
    const photo = $('#spinPhoto');

    // Size one copy of the phrase to fill the full circle → seamless loop, no clipping.
    function fit() {
      if (!text || !path) return;
      const tp = text.querySelector('textPath');
      if (!tp) return;
      const target = path.getTotalLength() * 0.99;
      let f = 6;
      text.style.fontSize = f + 'px';
      for (let i = 0; i < 4; i++) {
        const len = tp.getComputedTextLength();
        if (!len) break;
        f = f * (target / len);
        text.style.fontSize = f + 'px';
      }
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    else fit();
    setTimeout(fit, 900); // re-fit once the web font + layout settle

    // Graceful product image: silhouette blends via CSS; falls back to wordmark if missing.
    if (photo) {
      const wrap = photo.closest('.spin-photo');
      photo.addEventListener('load', () => { if (wrap) wrap.classList.add('loaded'); });
      photo.addEventListener('error', () => { photo.style.display = 'none'; });
    }
  })();

  /* ---------- Magnetic text (vanilla port of MagneticText) ---------- */
  (function magneticText() {
    const el = $('#magnetic');
    if (!el) return;
    const hoverText = el.dataset.hover || el.dataset.text || el.textContent.trim();
    const circle = document.createElement('div'); circle.className = 'magnet-circle';
    const inner = document.createElement('div'); inner.className = 'magnet-innertext';
    const hspan = document.createElement('span'); hspan.textContent = hoverText;
    inner.appendChild(hspan); circle.appendChild(inner); el.appendChild(circle);

    // No magnetic effect on touch / reduced motion — base text stays fully legible.
    if (reduce || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    function size() { inner.style.width = el.offsetWidth + 'px'; inner.style.height = el.offsetHeight + 'px'; }
    size(); window.addEventListener('resize', size);

    const mouse = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const lerp = (a, b, f) => a + (b - a) * f;
    (function animate() {
      cur.x = lerp(cur.x, mouse.x, 0.15);
      cur.y = lerp(cur.y, mouse.y, 0.15);
      circle.style.transform = `translate(${cur.x}px, ${cur.y}px) translate(-50%, -50%)`;
      inner.style.transform = `translate(${-cur.x}px, ${-cur.y}px)`;
      requestAnimationFrame(animate);
    })();

    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    el.addEventListener('mouseenter', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      mouse.x = x; mouse.y = y; cur.x = x; cur.y = y;
      circle.style.width = '150px'; circle.style.height = '150px';
    });
    el.addEventListener('mouseleave', () => { circle.style.width = '0'; circle.style.height = '0'; });
  })();

  /* ---------- Active section in nav ---------- */
  const navLinks = $$('.nav-links a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = '#' + en.target.id;
          navLinks.forEach(a => a.style.opacity = a.getAttribute('href') === id ? '1' : '');
        }
      });
    }, { threshold: 0.4, rootMargin: '-20% 0px -40% 0px' });
    sections.forEach(s => sio.observe(s));
  }

  /* ---------- Auto-looping gallery (2s) with rotating label ---------- */
  const gTrack = $('#galleryTrack');
  const gRotate = $('#galleryRotate');
  if (gTrack && gRotate) {
    const items = $$('.gallery-item', gTrack);
    let current = -1;

    const renderLabel = (text) => {
      gRotate.innerHTML = '';
      const words = text.split(' ');
      let charIndex = 0;
      words.forEach((word, wi) => {
        const wEl = document.createElement('span');
        wEl.className = 'gw';
        for (const ch of word) {
          const cEl = document.createElement('span');
          cEl.className = 'gc';
          cEl.textContent = ch;
          cEl.style.animationDelay = (charIndex * 0.012) + 's';
          wEl.appendChild(cEl);
          charIndex++;
        }
        gRotate.appendChild(wEl);
        if (wi !== words.length - 1) {
          const sp = document.createElement('span');
          sp.className = 'gw';
          sp.innerHTML = '&nbsp;';
          gRotate.appendChild(sp);
        }
      });
    };

    const setActive = (idx) => {
      if (idx === current) return;
      current = idx;
      items.forEach((it, i) => it.classList.toggle('is-active', i === idx));
      renderLabel(items[idx].dataset.label || '');
    };

    setActive(0);
    if (!reduce && items.length > 1) {
      setInterval(() => setActive((current + 1) % items.length), 2000);
    }
  }

  /* ---------- Use-case accordion ---------- */
  $$('.uc-accordion .uc-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      // close siblings
      $$('.uc-accordion .uc-head').forEach(b => {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          b.nextElementSibling.style.maxHeight = null;
        }
      });
      btn.setAttribute('aria-expanded', String(!open));
      panel.style.maxHeight = open ? null : panel.scrollHeight + 'px';
    });
  });
})();
