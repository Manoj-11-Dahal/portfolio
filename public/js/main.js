function revealVisible() {
  document.querySelectorAll('.reveal').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) el.classList.add('visible');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function updateScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, scrollY / max));
  bar.style.transform = `scaleX(${progress})`;
  window.AppState?.set({ scrollProgress: progress }, { persist: false });
}

function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader || preloader.classList.contains('loaded')) return;
  preloader.classList.add('loaded');
  setTimeout(() => preloader.remove(), 900);
}

function setupPreloader() {
  window.addEventListener('blackhole:ready', () => {
    setTimeout(hidePreloader, 550);
    showToast('blackhole.glb loaded');
  }, { once: true });
  setTimeout(hidePreloader, 3500);
}

function setupCursorEffects() {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-orb';
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.append(cursor, dot);

  let x = innerWidth / 2, y = innerHeight / 2;
  let tx = x, ty = y;

  window.addEventListener('pointermove', (event) => {
    tx = event.clientX;
    ty = event.clientY;
    document.documentElement.style.setProperty('--mouse-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${event.clientY}px`);
  }, { passive: true });

  function loop() {
    x += (tx - x) * 0.14;
    y += (ty - y) * 0.14;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
    if (!window.__BLACKHOLE_MOTION_PAUSED) requestAnimationFrame(loop);
    else setTimeout(() => requestAnimationFrame(loop), 120);
  }
  loop();

  document.addEventListener('pointerover', (event) => {
    if (event.target.closest('a, button, input, textarea, select, .panel')) {
      cursor.classList.add('cursor-hover');
    }
  });
  document.addEventListener('pointerout', (event) => {
    if (event.target.closest('a, button, input, textarea, select, .panel')) {
      cursor.classList.remove('cursor-hover');
    }
  });
}

function setupTiltCards() {
  document.querySelectorAll('.panel').forEach((card) => {
    if (card.dataset.tiltReady) return;
    card.dataset.tiltReady = 'true';
    card.addEventListener('pointermove', (event) => {
      if (document.documentElement.classList.contains('motion-paused')) return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-py * 5).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(px * 5).toFixed(2)}deg`);
      card.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

function setupMagneticButtons() {
  document.querySelectorAll('.btn, .chip, .control-pill').forEach((btn) => {
    if (btn.dataset.magneticReady) return;
    btn.dataset.magneticReady = 'true';
    btn.addEventListener('pointermove', (event) => {
      if (document.documentElement.classList.contains('motion-paused')) return;
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.16;
      btn.style.setProperty('--magnet-x', `${x}px`);
      btn.style.setProperty('--magnet-y', `${y}px`);
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--magnet-x', '0px');
      btn.style.setProperty('--magnet-y', '0px');
    });
  });
}

function setupMotionControls() {
  const btn = document.getElementById('toggle-motion');
  const qualityBtn = document.getElementById('cycle-quality');
  const stateToggle = document.getElementById('state-panel-toggle');
  const stateClose = document.getElementById('state-panel-close');
  const panel = document.getElementById('advanced-state-panel');

  function apply(state = window.AppState?.get()) {
    const paused = state?.motion === 'paused';
    window.__BLACKHOLE_MOTION_PAUSED = paused;
    document.documentElement.classList.toggle('motion-paused', paused);
    if (btn) btn.textContent = paused ? 'Resume Motion' : 'Pause Motion';
    if (qualityBtn) qualityBtn.textContent = `Quality: ${(state?.quality || 'high').replace(/^./, c => c.toUpperCase())}`;
  }

  apply();
  window.AppState?.subscribe((state) => apply(state));

  btn?.addEventListener('click', () => {
    const motion = window.AppState?.toggleMotion() || (window.__BLACKHOLE_MOTION_PAUSED ? 'on' : 'paused');
    showToast(motion === 'paused' ? 'Motion paused' : 'Motion resumed');
  });

  qualityBtn?.addEventListener('click', () => {
    const quality = window.AppState?.cycleQuality() || 'high';
    showToast(`Animation quality: ${quality}`);
  });

  function setPanel(open) {
    panel?.classList.toggle('open', open);
    panel?.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  stateToggle?.addEventListener('click', () => setPanel(!panel?.classList.contains('open')));
  stateClose?.addEventListener('click', () => setPanel(false));
}

function setupCopyEmail() {
  const btn = document.getElementById('copy-email');
  btn?.addEventListener('click', async () => {
    const email = btn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast(`${email} copied`);
    } catch {
      showToast(email);
    }
  });
}

function openModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.AppState?.set({ modalOpen: true }, { persist: false });
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  window.AppState?.set({ modalOpen: false }, { persist: false });
}

function setupModal() {
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-modal]')) closeModal();
    if (event.target.closest('.open-project')) openModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}


function setupCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('command-input');
  if (!palette) return;

  function openCommand() {
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    window.AppState?.set({ commandOpen: true }, { persist: false });
    setTimeout(() => input?.focus(), 20);
  }
  function closeCommand() {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
    window.AppState?.set({ commandOpen: false }, { persist: false });
    input && (input.value = '');
    filterCommands('');
  }
  function filterCommands(term) {
    document.querySelectorAll('.command-list button').forEach((button) => {
      button.hidden = !button.textContent.toLowerCase().includes(term.toLowerCase());
    });
  }
  function goTo(hash) {
    closeCommand();
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Navigating to ${hash.replace('#', '')}`);
  }

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      palette.classList.contains('open') ? closeCommand() : openCommand();
      return;
    }
    if (event.key === 'Escape') closeCommand();
    if (!typing && !palette.classList.contains('open')) {
      if (event.key.toLowerCase() === 'p') goTo('#projects');
      if (event.key.toLowerCase() === 's') goTo('#services');
      if (event.key.toLowerCase() === 'c') goTo('#contact');
      if (event.key.toLowerCase() === 'm') document.getElementById('toggle-motion')?.click();
      if (event.key === '/') { event.preventDefault(); openCommand(); }
    }
  });

  input?.addEventListener('input', () => filterCommands(input.value));
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-command]')) closeCommand();
    const link = event.target.closest('[data-command-link]');
    if (link) goTo(link.dataset.commandLink);
    const action = event.target.closest('[data-command-action]');
    if (action?.dataset.commandAction === 'toggle-motion') {
      closeCommand();
      document.getElementById('toggle-motion')?.click();
    }
    if (action?.dataset.commandAction === 'copy-email') {
      closeCommand();
      document.getElementById('copy-email')?.click();
    }
  });
}


function setupMotionPackageAnimations(root = document) {
  const motion = window.Motion;
  if (!motion?.animate) return;

  const cards = [...root.querySelectorAll('.project-card, .service-card, .pricing-card, .testimonial-card, .trust-item')]
    .filter((el) => !el.dataset.motionAnimated);
  cards.forEach((el) => { el.dataset.motionAnimated = 'true'; });
  if (cards.length) {
    motion.animate(
      cards,
      { opacity: [0, 1], y: [26, 0], scale: [0.985, 1] },
      { duration: 0.62, delay: motion.stagger ? motion.stagger(0.045) : 0, easing: 'ease-out' }
    );
  }

  root.querySelectorAll('.stat-card strong').forEach((stat) => {
    if (stat.dataset.counted) return;
    const text = stat.textContent.trim();
    const number = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(number)) return;
    const suffix = text.replace(/[0-9.]/g, '');
    stat.dataset.counted = 'true';
    motion.animate(0, number, {
      duration: 1.25,
      easing: 'ease-out',
      onUpdate: (latest) => {
        stat.textContent = `${Math.round(latest)}${suffix}`;
      }
    });
  });

  root.querySelectorAll('.section-heading h2').forEach((heading) => {
    if (heading.dataset.motionTitle) return;
    heading.dataset.motionTitle = 'true';
    motion.animate(heading, { opacity: [0, 1], letterSpacing: ['-0.08em', '-0.045em'] }, { duration: 0.75, easing: 'ease-out' });
  });
}


function setupMotionHover() {
  const motion = window.Motion;
  if (!motion?.animate) return;
  document.querySelectorAll('.btn, .chip, .control-pill, .command-list button').forEach((el) => {
    if (el.dataset.motionHover) return;
    el.dataset.motionHover = 'true';
    el.addEventListener('pointerenter', () => {
      if (window.__BLACKHOLE_MOTION_PAUSED) return;
      motion.animate(el, { scale: 1.045 }, { duration: 0.18, easing: 'ease-out' });
    });
    el.addEventListener('pointerleave', () => {
      motion.animate(el, { scale: 1 }, { duration: 0.22, easing: 'ease-out' });
    });
    el.addEventListener('pointerdown', () => {
      if (window.__BLACKHOLE_MOTION_PAUSED) return;
      motion.animate(el, { scale: 0.965 }, { duration: 0.08 });
    });
    el.addEventListener('pointerup', () => {
      motion.animate(el, { scale: 1.035 }, { duration: 0.12 });
    });
  });
}

function setupGravityRipple() {
  const motion = window.Motion;
  if (!motion?.animate || document.body.dataset.rippleReady) return;
  document.body.dataset.rippleReady = 'true';
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('a, button, .project-card, .service-card, .pricing-card, .trust-item');
    if (!trigger || window.__BLACKHOLE_MOTION_PAUSED) return;
    const ripple = document.createElement('div');
    ripple.className = 'gravity-ripple';
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    document.body.appendChild(ripple);
    motion.animate(
      ripple,
      { scale: [0.1, 1.9], opacity: [0.72, 0] },
      { duration: 0.72, easing: 'ease-out' }
    ).finished.finally(() => ripple.remove());
  });
}

function setupHeroMotion() {
  const motion = window.Motion;
  if (!motion?.animate) return;
  const heroTitle = document.querySelector('.hero h1');
  const heroText = document.querySelector('.hero-text');
  const heroActions = document.querySelector('.hero-actions');
  if (heroTitle && !heroTitle.dataset.motionHero) {
    heroTitle.dataset.motionHero = 'true';
    motion.animate(heroTitle, { opacity: [0, 1], y: [32, 0], filter: ['blur(12px)', 'blur(0px)'] }, { duration: 0.95, easing: 'ease-out' });
  }
  if (heroText && !heroText.dataset.motionHero) {
    heroText.dataset.motionHero = 'true';
    motion.animate(heroText, { opacity: [0, 1], y: [18, 0] }, { duration: 0.75, delay: 0.12, easing: 'ease-out' });
  }
  if (heroActions && !heroActions.dataset.motionHero) {
    heroActions.dataset.motionHero = 'true';
    motion.animate(heroActions.children, { opacity: [0, 1], y: [18, 0] }, { duration: 0.55, delay: motion.stagger ? motion.stagger(0.08, { startDelay: 0.22 }) : 0.22, easing: 'ease-out' });
  }
}

function setupOrbitNav() {
  const motion = window.Motion;
  const links = [...document.querySelectorAll('[data-orbit-link]')];
  if (!links.length || document.body.dataset.orbitReady) return;
  document.body.dataset.orbitReady = 'true';
  const sectionIds = links.map((link) => link.dataset.orbitLink).filter(Boolean);
  function setActive(id) {
    window.AppState?.set({ activeSection: id }, { persist: false });
    links.forEach((link) => {
      const active = link.dataset.orbitLink === id;
      link.classList.toggle('active', active);
      if (active && motion?.animate && !window.__BLACKHOLE_MOTION_PAUSED) {
        motion.animate(link.querySelector('span'), { scale: [1, 1.65, 1], boxShadow: ['0 0 0 rgba(103,232,249,0)', '0 0 28px rgba(103,232,249,.8)', '0 0 10px rgba(103,232,249,.35)'] }, { duration: 0.55 });
      }
    });
  }
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id || 'top');
  }, { threshold: [0.25, 0.45, 0.65], rootMargin: '-18% 0px -55% 0px' });
  sectionIds.forEach((id) => {
    const target = id === 'top' ? document.getElementById('top') : document.getElementById(id);
    if (target) observer.observe(target);
  });
}

function setupMotionInView() {
  const motion = window.Motion;
  if (!motion?.inView || !motion?.animate) return;
  motion.inView('.process-step, .faq-item, .contract-card', (el) => {
    if (el.dataset.motionViewed) return;
    el.dataset.motionViewed = 'true';
    motion.animate(el, { opacity: [0, 1], x: [-24, 0] }, { duration: 0.55, easing: 'ease-out' });
  }, { amount: 0.18 });
}

function enhanceMotion() {
  revealVisible();
  setupTiltCards();
  setupMagneticButtons();
  setupMotionPackageAnimations();
  setupMotionHover();
  setupMotionInView();
}

window.addEventListener('scroll', () => {
  revealVisible();
  updateScrollProgress();
}, { passive: true });
window.addEventListener('resize', updateScrollProgress, { passive: true });
window.addEventListener('load', () => {
  setupPreloader();
  setupCursorEffects();
  setupMotionControls();
  setupCopyEmail();
  setupModal();
  setupCommandPalette();
  setupHeroMotion();
  setupGravityRipple();
  setupOrbitNav();
  enhanceMotion();
  updateScrollProgress();
});
document.addEventListener('htmx:afterSwap', (event) => {
  enhanceMotion();
  if (event.detail?.target) setupMotionPackageAnimations(event.detail.target);
  if (event.detail?.target?.id === 'modal-body') openModal();
  if (event.detail?.target?.id === 'contact-panel') showToast('Contact form updated');
});
