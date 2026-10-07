/* SKR — SIVABHAGYA · interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const loader = $('.loader');

  $$('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- Text splitting ---------- */
  $$('[data-split="chars"]').forEach(el => {
    el.setAttribute('aria-label', el.textContent);
    el.innerHTML = [...el.textContent].map(c => `<span class="char" aria-hidden="true">${c}</span>`).join('');
  });
  $$('[data-split="lines"]').forEach(el => {
    el.innerHTML = el.innerHTML
      .split(/<br\s*\/?>/i)
      .map(part => `<span class="line-mask"><span>${part.trim()}</span></span>`)
      .join('');
  });
  $$('[data-reveal-words]').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="word">${w}</span>`).join(' ');
  });

  /* ---------- Menu, links, form (work with or without motion) ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const menu = $('.menu');
  let lenis = null;

  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.remove('is-hidden');
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));

  const locationSelect = $('.booking select[name="location"]');
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      e.preventDefault();
      if (id === '#') return;
      if (a.dataset.location) locationSelect.value = a.dataset.location;
      if (menu.classList.contains('is-open')) setMenu(false);
      const target = id === '#top' ? 0 : $(id);
      if (lenis) lenis.scrollTo(target, { duration: 1.8 });
      else if (target === 0) scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const form = $('.booking');
  const msg = $('.booking__msg');
  const today = new Date().toISOString().split('T')[0];
  form.arrival.min = today;
  form.departure.min = today;
  form.arrival.addEventListener('change', () => (form.departure.min = form.arrival.value || today));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const { location, arrival, departure, guests } = form;
    if (!arrival.value || !departure.value) {
      msg.textContent = 'Kindly choose your arrival and departure dates.';
      return;
    }
    if (departure.value <= arrival.value) {
      msg.textContent = 'Departure should be after arrival.';
      return;
    }
    const fmt = v => new Date(v + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    msg.textContent = `Thank you. Our ${location.value} desk will confirm your stay for ${guests.value}, ${fmt(arrival.value)} – ${fmt(departure.value)}.`;
  });

  /* ---------- Nav state ---------- */
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > innerHeight * 0.75);
    if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > innerHeight);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });

  if (!hasGsap || reduceMotion) {
    loader && loader.remove();
    return;
  }

  /* =========================================================
     Motion
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    window.lenis = lenis;
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------- Intro ---------- */
  const chars = $$('.hero__name .char');
  gsap.set('.hero__logo', { opacity: 0, scale: 1.12, filter: 'blur(14px)' });
  gsap.set(chars, { opacity: 0, yPercent: 60, filter: 'blur(8px)' });
  gsap.set(['.hero__pre', '.hero__tag', '.hero__foot'], { opacity: 0, y: 16 });
  gsap.set('.nav', { opacity: 0, y: -20 });
  gsap.set('.hero__glow', { opacity: 0, scale: 0.6 });

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .to('.loader__mark', { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .to('.loader__line', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, '<0.1')
    .to('.loader__mark', { opacity: 0, y: -10, duration: 0.5, ease: 'power2.in' }, '-=0.2')
    .to('.loader__line', { opacity: 0, duration: 0.4 }, '<0.2')
    .to('.loader__half--top', { yPercent: -100, duration: 1.4, ease: 'expo.inOut' }, '<')
    .to('.loader__half--bottom', { yPercent: 100, duration: 1.4, ease: 'expo.inOut' }, '<')
    .to('.hero__glow', { opacity: 1, scale: 1, duration: 2.4, ease: 'power2.out' }, '<0.4')
    .to('.hero__logo', { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 2.2 }, '<0.1')
    .to('.hero__pre', { opacity: 1, y: 0, duration: 1.2 }, '<0.7')
    .to(chars, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.4, stagger: 0.06 }, '<0.1')
    .to(['.hero__tag', '.hero__foot'], { opacity: 1, y: 0, duration: 1.2, stagger: 0.12 }, '<0.6')
    .to('.nav', { opacity: 1, y: 0, duration: 1.2 }, '<')
    .add(() => {
      loader.remove();
      lenis && lenis.start();
    });

  /* ---------- Hero parallax out ---------- */
  gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  })
    .to('.hero__inner', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
    .to('.hero__name', { letterSpacing: '0.42em', ease: 'none' }, 0)
    .to('.hero__glow', { scale: 1.4, opacity: 0.3, ease: 'none' }, 0)
    .to('.hero__beams', { opacity: 0, ease: 'none' }, 0)
    .to('.hero__foot', { opacity: 0, ease: 'none', duration: 0.3 }, 0);

  /* Glow follows the pointer gently */
  if (matchMedia('(pointer: fine)').matches) {
    const gx = gsap.quickTo('.hero__glow', 'x', { duration: 2, ease: 'power3.out' });
    const gy = gsap.quickTo('.hero__glow', 'y', { duration: 2, ease: 'power3.out' });
    $('.hero').addEventListener('mousemove', e => {
      gx((e.clientX / innerWidth - 0.5) * 80);
      gy((e.clientY / innerHeight - 0.5) * 60);
    });
  }

  /* ---------- Line reveals for headings ---------- */
  $$('.line-mask > span').forEach(line => {
    gsap.from(line, {
      yPercent: 110,
      duration: 1.4,
      ease: 'expo.out',
      scrollTrigger: { trigger: line.parentElement, start: 'top 88%' }
    });
  });

  $$('.eyebrow').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      x: -20,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }
    });
  });

  /* ---------- Statement: words light up as you read ---------- */
  gsap.fromTo('.statement__text .word',
    { opacity: 0.12 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: '.statement__text', start: 'top 78%', end: 'bottom 45%', scrub: true }
    });

  /* ---------- Lobby: window opens into full bleed ---------- */
  gsap.timeline({
    scrollTrigger: { trigger: '.frame', start: 'top top', end: '+=110%', pin: true, scrub: 1, refreshPriority: 2 }
  })
    .fromTo('.frame__media',
      { clipPath: 'inset(16% 24% 16% 24%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 }, 0)
    .fromTo('.frame__media img', { scale: 1.35 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .from('.frame__media figcaption span', { opacity: 0, y: 20, stagger: 0.1, duration: 0.3 }, 0.75);

  /* ---------- Gold motif draws in ---------- */
  const drawable = $$('.motif path, .loc__lines path');
  drawable.forEach(p => {
    p.setAttribute('pathLength', '1');
    gsap.set(p, { strokeDasharray: 1, strokeDashoffset: 1 });
  });

  gsap.timeline({
    scrollTrigger: { trigger: '.motif', start: 'top 85%', end: 'bottom 35%', scrub: 1 }
  })
    .to('.motif path:not(.motif__center)', { strokeDashoffset: 0, ease: 'none', duration: 1 })
    .to('.motif__center', { opacity: 1, strokeDashoffset: 0, ease: 'none', duration: 0.4 })
    .from('.motif__crown', { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power2.out' }, '-=0.3');

  /* ---------- Locations ---------- */
  const mm = gsap.matchMedia();
  const track = $('.locations__track');
  const panels = $$('.loc');

  mm.add('(min-width: 961px)', () => {
    const distance = () => track.scrollWidth - innerWidth;

    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.locations__pin',
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        onUpdate: self => gsap.set('.locations__progress span', { scaleX: self.progress })
      }
    });

    panels.forEach((panel, i) => {
      const body = $$('.loc__label, .loc__city, .loc__desc, .loc__meta, .loc__actions', panel);
      const lines = $$('.loc__lines path', panel);
      const num = $('.loc__num', panel);

      if (i === 0) {
        gsap.from(body, {
          opacity: 0, y: 40, duration: 1.4, stagger: 0.08, ease: 'expo.out',
          scrollTrigger: { trigger: '.locations__pin', start: 'top 60%' }
        });
        gsap.to(lines, {
          strokeDashoffset: 0, duration: 2.4, stagger: 0.3, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.locations__pin', start: 'top 40%' }
        });
        gsap.from(num, {
          opacity: 0, x: -60, duration: 1.8, ease: 'expo.out',
          scrollTrigger: { trigger: '.locations__pin', start: 'top 60%' }
        });
        return;
      }

      gsap.from(body, {
        opacity: 0, x: 120, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left 85%', end: 'left 25%', scrub: true }
      });
      gsap.to(lines, {
        strokeDashoffset: 0, ease: 'none', stagger: 0.2,
        scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left 70%', end: 'center center', scrub: true }
      });
      gsap.fromTo(num, { x: 180 }, {
        x: -60, ease: 'none',
        scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true }
      });
    });
  });

  mm.add('(max-width: 960px)', () => {
    panels.forEach(panel => {
      gsap.from($$('.loc__label, .loc__city, .loc__desc, .loc__meta, .loc__actions', panel), {
        opacity: 0, y: 40, duration: 1.2, stagger: 0.08, ease: 'expo.out',
        scrollTrigger: { trigger: panel, start: 'top 75%' }
      });
      gsap.to($$('.loc__lines path', panel), {
        strokeDashoffset: 0, duration: 2, stagger: 0.3, ease: 'power2.inOut',
        scrollTrigger: { trigger: panel, start: 'top 60%' }
      });
    });
  });

  /* ---------- Experience rows ---------- */
  gsap.from('.exp__row', {
    opacity: 0,
    y: 50,
    duration: 1.3,
    stagger: 0.12,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.exp', start: 'top 80%' }
  });

  /* ---------- Marquee leans with scroll velocity ---------- */
  const marquee = $('.marquee__track');
  const skew = gsap.quickTo(marquee, 'skewX', { duration: 0.6, ease: 'power3.out' });
  ScrollTrigger.create({
    trigger: '.marquee',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: self => skew(gsap.utils.clamp(-8, 8, self.getVelocity() / -300))
  });

  /* ---------- Reserve ---------- */
  gsap.from('.booking > *', {
    opacity: 0,
    y: 30,
    duration: 1.2,
    stagger: 0.08,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.booking', start: 'top 88%' }
  });
  gsap.from('.reserve__glow', {
    opacity: 0,
    scale: 0.7,
    ease: 'none',
    scrollTrigger: { trigger: '.reserve', start: 'top bottom', end: 'center center', scrub: true }
  });

  gsap.from('.footer__crest', {
    opacity: 0, y: 30, scale: 0.9, duration: 1.6, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer', start: 'top 85%' }
  });

  /* ---------- Cursor & magnetic ---------- */
  if (matchMedia('(pointer: fine)').matches) {
    const cursor = $('.cursor');
    const dx = gsap.quickTo('.cursor__dot', 'x', { duration: 0.12 });
    const dy = gsap.quickTo('.cursor__dot', 'y', { duration: 0.12 });
    const rx = gsap.quickTo('.cursor__ring', 'x', { duration: 0.55, ease: 'power3.out' });
    const ry = gsap.quickTo('.cursor__ring', 'y', { duration: 0.55, ease: 'power3.out' });

    addEventListener('mousemove', e => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    });
    $$('a, button, select, input, .exp__row').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    $$('[data-magnetic]').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  ScrollTrigger.sort();
  addEventListener('load', () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
