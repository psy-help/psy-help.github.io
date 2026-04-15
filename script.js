/* ═══════════════════════════════════════════════════
   script.js — Editorial Gestalt Landing
═══════════════════════════════════════════════════ */
'use strict';

/* ── HERO CANVAS BACKGROUND ─────────────────────────────── */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, circles, raf;
  const CIRCLE_COUNT = 10;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkCircle() {
    const r = 80 + Math.random() * 240;
    const colors = [
      'rgba(200, 121, 61, 0.13)',
      'rgba(246, 240, 232, 0.08)',
      'rgba(180, 90, 30, 0.11)',
    ];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      stroke: colors[Math.floor(Math.random() * colors.length)],
      lw: 0.8 + Math.random() * 1.8,
    };
  }

  function buildCircles() {
    circles = Array.from({ length: CIRCLE_COUNT }, mkCircle);
  }

  function drawGrid() {
    const step = Math.min(W, H) * 0.09;
    ctx.strokeStyle = 'rgba(246,240,232,0.028)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = 0; x < W; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
    }
    for (let y = 0; y < H; y += step) {
      ctx.moveTo(0, y); ctx.lineTo(W, y);
    }
    ctx.stroke();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    circles.forEach(c => {
      c.x += c.dx;
      c.y += c.dy;
      // wrap around
      if (c.x - c.r > W) c.x = -c.r;
      if (c.x + c.r < 0) c.x = W + c.r;
      if (c.y - c.r > H) c.y = -c.r;
      if (c.y + c.r < 0) c.y = H + c.r;

      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = c.lw;
      ctx.stroke();

      // inner echo ring
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = c.lw * 0.5;
      ctx.stroke();
    });

    raf = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => {
    resize();
    buildCircles();
  });
  ro.observe(canvas.parentElement);

  resize();
  buildCircles();
  tick();

  // Pause animation when hero not visible
  const heroObs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) tick(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0.01 });
  heroObs.observe(canvas.parentElement);
}
initHeroCanvas();

document.addEventListener('DOMContentLoaded', () => {

  /* ── CUSTOM CURSOR ──────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (cursor && follower && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let follX = 0, follY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.top = mouseX + 'px';
      cursor.style.left = mouseY + 'px';

      // direct positioning for cursor dot
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    });

    // Smooth follower
    const animFollower = () => {
      follX += (mouseX - follX) * 0.12;
      follY += (mouseY - follY) * 0.12;
      follower.style.left = follX + 'px';
      follower.style.top = follY + 'px';
      requestAnimationFrame(animFollower);
    };
    animFollower();

    // Expand on interactive elements
    const interactives = document.querySelectorAll('a, button, .gestalt__item, .gestalt__topics-list span, .service-item, .tag, .review');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        follower.classList.add('expand');
        cursor.style.transform = 'translate(-50%,-50%) scale(0.4)';
      });
      el.addEventListener('mouseleave', () => {
        follower.classList.remove('expand');
        cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });
  } else {
    if (cursor) cursor.style.display = 'none';
    if (follower) follower.style.display = 'none';
  }

  /* ── NAV SCROLL ─────────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 40;
    nav.classList.toggle('scrolled', isScrolled);
    document.body.classList.toggle('is-scrolled', isScrolled);
  }, { passive: true });

  /* ── FULL-SCREEN MENU ────────────────────────────── */
  const burger = document.getElementById('navBurger');
  const fullMenu = document.getElementById('fullMenu');
  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
    burger.classList.toggle('open', menuOpen);
    fullMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', toggleMenu);
  fullMenu.querySelectorAll('.fullmenu__link').forEach(link => {
    link.addEventListener('click', () => {
      if (menuOpen) toggleMenu();
    });
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) toggleMenu();
  });

  /* ── REVEAL TEXT SPLIT ───────────────────────────── */
  // Wrap each line in .reveal-line span for animation
  document.querySelectorAll('[data-reveal-text]').forEach(el => {
    // Get the innerHTML, split by <br/> tags
    const html = el.innerHTML;
    const parts = html.split(/<br\s*\/?>/gi);
    el.innerHTML = parts.map(part =>
      `<span class="reveal-line" aria-hidden="false">${part}</span>`
    ).join('');
  });

  /* ── INTERSECTION OBSERVER ───────────────────────── */
  const observerOpts = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseFloat(entry.target.dataset.delay || 0);
        setTimeout(() => entry.target.classList.add('in-view'), delay * 1000);
        revealObs.unobserve(entry.target);
      }
    });
  }, observerOpts);

  document.querySelectorAll('[data-reveal-text], [data-fade]').forEach(el => {
    revealObs.observe(el);
  });

  /* ── STEP REVEAL ON SCROLL ──────────────────────── */
  const stepObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        stepObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.process__step, .gestalt__item, .about__cred, .service-item, .review').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .7s var(--ease-out), transform .7s var(--ease-out)';
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    stepObs.observe(el);
  });

  /* ── FAQ ACCORDION ───────────────────────────────── */
  document.querySelectorAll('.faq__item').forEach(item => {
    const btn = item.querySelector('.faq__q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq__item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── CONTACT FORM ────────────────────────────────── */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('formSubmit');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!validateForm()) return;

      submitBtn.disabled = true;
      const origContent = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Отправляем…</span>';

      // Simulate network request
      await new Promise(r => setTimeout(r, 1400));

      // Hide form fields, show success
      [...form.children].forEach(ch => ch.style.display = 'none');
      formSuccess.style.display = 'block';
      formSuccess.style.opacity = '0';
      formSuccess.style.transform = 'translateY(20px)';
      formSuccess.style.transition = 'opacity .5s ease, transform .5s ease';
      requestAnimationFrame(() => {
        formSuccess.style.opacity = '1';
        formSuccess.style.transform = 'none';
      });
    });
  }

  function validateForm() {
    let ok = true;
    form.querySelectorAll('[required]').forEach(inp => {
      inp.classList.remove('error');
      if (!inp.value.trim()) {
        inp.classList.add('error');
        ok = false;
        inp.addEventListener('input', () => inp.classList.remove('error'), { once: true });
      }
    });
    if (!ok) form.querySelector('.error')?.focus();
    return ok;
  }

  /* ── MARQUEE PAUSE ON HOVER ──────────────────────── */
  const marquee = document.querySelector('.marquee__track');
  if (marquee) {
    marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
    marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
  }

  /* ── HERO STATS COUNTER ──────────────────────────── */
  // No data-count in this version — stats are static text
  // Animate them with a subtle fade-up when in view
  const statsBar = document.querySelector('.hero__stats-bar');
  if (statsBar) {
    const statsObs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        statsBar.querySelectorAll('.hero__stat').forEach((s, i) => {
          s.style.opacity = '0';
          s.style.transform = 'translateY(16px)';
          s.style.transition = 'opacity .6s ease, transform .6s ease';
          s.style.transitionDelay = `${i * 0.1}s`;
          setTimeout(() => {
            s.style.opacity = '1';
            s.style.transform = 'none';
          }, 100 + i * 100);
        });
        statsObs.disconnect();
      }
    }, { threshold: 0.5 });
    statsObs.observe(statsBar);
  }

  /* ── SMOOTH ACTIVE NAV LINK ──────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  let lastActive = '';

  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        lastActive = entry.target.id;
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObs.observe(s));

  /* ── TILT SERVICE ITEMS ──────────────────────────── */
  // Subtle horizontal reveal on service items
  document.querySelectorAll('.service-item__price-amount').forEach(el => {
    const parent = el.closest('.service-item');
    parent?.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.04)';
      el.style.transition = 'transform .3s var(--ease-out, ease)';
    });
    parent?.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  /* ── HERO PARALLAX (subtle) ───────────────────────── */
  const heroImg = document.querySelector('.hero__img-frame');
  if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroImg.style.transform = `translateY(${scrolled * 0.08}px)`;
      }
    }, { passive: true });
  }

  /* ── GESTALT ITEMS MAGNETIC HOVER ───────────── */
  document.querySelectorAll('.gestalt__item').forEach(card => {
    card.addEventListener('mousemove', e => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width * 8;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height * 8;
      const inner = card.querySelector('.gestalt__item-content');
      if (inner) inner.style.transform = `translate(${x}px, ${y}px)`;
    });
    card.addEventListener('mouseleave', () => {
      const inner = card.querySelector('.gestalt__item-content');
      if (inner) {
        inner.style.transform = '';
        inner.style.transition = 'transform .4s var(--ease-out, ease)';
        setTimeout(() => { inner.style.transition = ''; }, 400);
      }
    });
  });

  /* ── THEME PALETTE SWITCHER ─────────────────────── */
  const dots = document.querySelectorAll('.theme-dot');

  if (dots.length > 0) {
    // Initial active state set to theme 1
    dots[0].classList.add('theme-dot--active');

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = dot.dataset.theme;

        // Clear active states
        dots.forEach(d => d.classList.remove('theme-dot--active'));
        dot.classList.add('theme-dot--active');

        // Apply theme to body
        document.body.classList.remove('theme-2', 'theme-3', 'theme-4');
        if (theme > 1) {
          document.body.classList.add(`theme-${theme}`);
        }
      });
    });
  }

  /* ── GLOBAL SPRING SCROLL ───────────────────────── */
  const spring = document.getElementById('scrollSpring');
  const meter = document.getElementById('tensionMeter');
  const allSections = document.querySelectorAll('section.section');
  let currentIdx = 0;
  let tension = 0;
  let isTransitioning = false;

  // Track current section with high threshold for snap accuracy
  const snapObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(allSections).indexOf(entry.target);
        if (idx !== -1) currentIdx = idx;
      }
    });
  }, { threshold: 0.6 });
  allSections.forEach(s => snapObs.observe(s));

  window.addEventListener('wheel', (e) => {
    // Mobile — skip entirely, allow native scroll
    if (window.innerWidth < 1024) return;

    // Desktop: ALWAYS block native scroll so it never mixes with spring
    e.preventDefault();

    // During transition ignore wheel input completely
    if (isTransitioning) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    const canGoNext = direction === 1 && currentIdx < allSections.length - 1;
    const canGoPrev = direction === -1 && currentIdx > 0;

    if (!canGoNext && !canGoPrev) {
      // At boundary — reset tension silently
      tension = 0;
      return;
    }

    tension += Math.abs(e.deltaY) * 0.45;
    if (tension > 100) tension = 100;

    if (spring) spring.style.transform = `translateY(${100 - tension}%)`;
    if (meter) meter.style.opacity = '1';

    if (tension >= 100) {
      isTransitioning = true;
      tension = 0;
      const target = allSections[currentIdx + direction];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (spring) spring.style.transform = 'translateY(100%)';
        setTimeout(() => {
          if (meter) meter.style.opacity = '0';
        }, 400);

        // Wait for scroll animation to fully complete before allowing next
        setTimeout(() => {
          isTransitioning = false;
        }, 900);
      }
    }
  }, { passive: false });


  /* ── COOKIE CONSENT BANNER ──────────────────────── */
  const initCookieBanner = () => {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');

    if (!banner || !acceptBtn) return;

    if (localStorage.getItem('cookieConsent') === 'accepted') {
      banner.remove();
      return;
    }

    setTimeout(() => {
      banner.classList.add('is-visible');
    }, 2000);

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.classList.remove('is-visible');
      setTimeout(() => banner.remove(), 1000);
    });

    // Cursor expansion for the banner button
    acceptBtn.addEventListener('mouseenter', () => {
      const follower = document.getElementById('cursorFollower');
      const cursor = document.getElementById('cursor');
      if (follower) follower.classList.add('expand');
      if (cursor) cursor.style.transform = 'translate(-50%,-50%) scale(0.4)';
    });
    acceptBtn.addEventListener('mouseleave', () => {
      const follower = document.getElementById('cursorFollower');
      const cursor = document.getElementById('cursor');
      if (follower) follower.classList.remove('expand');
      if (cursor) cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  };

  initCookieBanner();
});
