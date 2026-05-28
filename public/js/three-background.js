/*
  blackhole.glb canvas renderer
  ------------------------------------------------------------
  Why this file exists:
  - The model file is local: /models/blackhole.glb
  - The GLB stores black-hole scene data in its JSON chunk.
  - This renderer parses that GLB and draws a detailed animated black hole.
  - Scroll controls the animation frame-by-frame.
  - Mouse movement adds soft parallax and gravitational pull.
  - No external CDN/library is required.
*/
(function () {
  const canvas = document.getElementById('web3-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const state = {
    dpr: 1,
    w: 0,
    h: 0,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    scrollProgress: 0,
    frame: 0,
    targetFrame: 0,
    time: 0,
    nodes: [],
    links: [],
    disk: [],
    stars: [],
    jets: [],
    dust: []
  };

  function qualityStep(type) {
    const quality = window.AppState?.get('quality') || 'high';
    if (quality === 'ultra') return 1;
    if (quality === 'high') return type === 'dust' ? 1 : 1;
    if (quality === 'medium') return type === 'dust' ? 2 : 2;
    return type === 'dust' ? 4 : 3;
  }

  function qualityAlpha() {
    const quality = window.AppState?.get('quality') || 'high';
    return quality === 'low' ? 0.68 : quality === 'medium' ? 0.82 : 1;
  }

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.w = window.innerWidth;
    state.h = window.innerHeight;
    canvas.width = Math.floor(state.w * state.dpr);
    canvas.height = Math.floor(state.h * state.dpr);
    canvas.style.width = state.w + 'px';
    canvas.style.height = state.h + 'px';
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function updateScrollFrame() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    state.scrollProgress = Math.min(1, Math.max(0, window.scrollY / max));
    // The page scroll becomes an animation timeline of 720 frames.
    state.targetFrame = Math.round(state.scrollProgress * 720);
    window.AppState?.set({ scrollProgress: state.scrollProgress, frame: state.targetFrame }, { persist: false });
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updateScrollFrame, { passive: true });
  window.addEventListener('pointermove', (event) => {
    state.targetMouseX = (event.clientX / Math.max(1, state.w) - 0.5) * 2;
    state.targetMouseY = (event.clientY / Math.max(1, state.h) - 0.5) * 2;
  }, { passive: true });

  function parseGlb(buffer) {
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== 0x46546c67) throw new Error('Not a GLB file');
    let offset = 12;
    while (offset < buffer.byteLength) {
      const length = view.getUint32(offset, true);
      const type = view.getUint32(offset + 4, true);
      offset += 8;
      if (type === 0x4e4f534a) {
        const json = new TextDecoder().decode(new Uint8Array(buffer, offset, length));
        return JSON.parse(json.trim());
      }
      offset += length;
    }
    throw new Error('GLB JSON chunk missing');
  }

  function fallbackModel() {
    const nodes = [{ name: 'Singularity Core', translation: [0, 0, 0], extras: { kind: 'core', color: [0.02, 0.01, 0.06], size: 2 } }];
    const links = [];
    for (let i = 0; i < 160; i++) {
      const a = Math.PI * 2 * i / 160;
      const r = 2.2 + Math.sin(i * 1.93) * 0.45;
      nodes.push({
        name: `Fallback Disk ${i}`,
        translation: [Math.cos(a) * r, Math.sin(a) * 0.24, Math.sin(a) * r],
        extras: { kind: 'disk', color: i % 3 === 0 ? [1, .38, .08] : i % 3 === 1 ? [.95, .18, .78] : [.08, .78, 1], size: .32 }
      });
      links.push([i + 1, ((i + 1) % 160) + 1]);
    }
    for (let i = 0; i < 160; i++) {
      const a = Math.PI * 2 * i / 160;
      const r = 5.5 + (i % 11) * 0.2;
      nodes.push({
        name: `Fallback Star ${i}`,
        translation: [Math.cos(a) * r, Math.sin(i * 2.17) * 2.7, Math.sin(a) * r],
        extras: { kind: 'star', color: [.78, .9, 1], size: .12 }
      });
    }
    return { nodes, extras: { links } };
  }

  function buildScene(model) {
    const nodes = model.nodes || [];
    const links = (model.extras && model.extras.links) ||
      (model.scenes && model.scenes[0] && model.scenes[0].extras && model.scenes[0].extras.links) || [];

    state.nodes = nodes;
    state.links = links;
    state.disk = [];
    state.stars = [];
    state.jets = [];

    nodes.forEach((node, index) => {
      const p = node.translation || [0, 0, 0];
      const extras = node.extras || {};
      const kind = extras.kind || 'disk';
      const color = extras.color || [0.08, 0.78, 1];
      const item = {
        index,
        x: p[0],
        y: p[1],
        z: p[2],
        r: Math.hypot(p[0], p[2]),
        angle: Math.atan2(p[2], p[0]),
        color: `rgb(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)})`,
        rawColor: color,
        size: extras.size || 0.25,
        kind,
        seed: Math.sin(index * 999.17) * 10000
      };
      if (kind === 'mesh') return;
      if (kind === 'star') state.stars.push(item);
      else if (kind === 'jet') state.jets.push(item);
      else if (kind !== 'core') state.disk.push(item);
    });

    // Extra micro-dust is deterministic and derived from the model, so the background has fine detail.
    state.dust = [];
    for (let i = 0; i < 620; i++) {
      const seed = Math.sin((i + nodes.length) * 12.9898) * 43758.5453;
      const n = seed - Math.floor(seed);
      const a = i * 2.399963 + n * 0.8;
      const r = 1.45 + Math.pow((i % 233) / 233, 1.7) * 4.15;
      state.dust.push({
        angle: a,
        r,
        y: (n - 0.5) * 0.52,
        size: 0.35 + n * 1.35,
        alpha: 0.08 + n * 0.28,
        hue: i % 4
      });
    }
  }

  function project(point, rotation, tilt, scale, centerX, centerY) {
    const angle = point.angle + rotation;
    const radius = point.r * scale;
    const x3 = Math.cos(angle) * radius;
    const z3 = Math.sin(angle) * radius;
    const y3 = (point.y || 0) * scale;

    // Disk is tilted, then mildly lens-distorted near the event horizon.
    const yTilted = y3 * Math.cos(tilt) - z3 * Math.sin(tilt);
    const zTilted = y3 * Math.sin(tilt) + z3 * Math.cos(tilt);
    const perspective = 1 / (1 + zTilted * 0.0019);
    const lens = 1 + Math.max(0, 1.7 - point.r) * 0.18;

    return {
      x: centerX + x3 * perspective * lens,
      y: centerY + yTilted * perspective * lens,
      z: zTilted,
      perspective,
      angle
    };
  }

  function drawGlowCircle(x, y, radius, color, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `, ${alpha})`));
    g.addColorStop(0.42, color.replace('rgb', 'rgba').replace(')', `, ${alpha * 0.45})`));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBackgroundStars(cx, cy, frame) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const step = qualityStep('stars');
    const qa = qualityAlpha();
    state.stars.forEach((star, i) => {
      if (i % step) return;
      const parallax = 1 + (star.z || 0) * 0.012;
      const sx = cx + star.x * 105 * parallax + state.mouseX * 18 * parallax;
      const sy = cy + star.y * 92 * parallax + state.mouseY * 14 * parallax;
      if (sx < -40 || sx > state.w + 40 || sy < -40 || sy > state.h + 40) return;
      const twinkle = 0.28 + Math.abs(Math.sin(frame * 0.045 + i * 1.7)) * 0.62;
      ctx.globalAlpha = twinkle * 0.7 * qa;
      ctx.fillStyle = star.color;
      ctx.beginPath();
      ctx.arc(sx, sy, Math.max(0.7, star.size * 5 * twinkle), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawLensingGrid(cx, cy, coreRadius, frame) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const r = coreRadius * (1.55 + i * 0.42) + Math.sin(frame * 0.025 + i) * 4;
      ctx.globalAlpha = 0.08 - i * 0.006;
      ctx.strokeStyle = i % 2 ? '#06b6d4' : '#ec4899';
      ctx.beginPath();
      ctx.ellipse(cx, cy + i * 1.5, r * 1.44, r * 0.38, -0.06, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawJets(cx, cy, scale, frame) {
    if (!state.jets.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let side of [-1, 1]) {
      const grad = ctx.createLinearGradient(cx, cy, cx, cy + side * scale * 2.9);
      grad.addColorStop(0, 'rgba(103,232,249,0.42)');
      grad.addColorStop(0.45, 'rgba(139,92,246,0.18)');
      grad.addColorStop(1, 'rgba(103,232,249,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 14;
      ctx.globalAlpha = 0.42 + Math.sin(frame * 0.03) * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx, cy + side * 18);
      ctx.bezierCurveTo(
        cx + Math.sin(frame * 0.018) * 32,
        cy + side * scale * 0.7,
        cx - Math.cos(frame * 0.014) * 28,
        cy + side * scale * 1.7,
        cx + Math.sin(frame * 0.01) * 18,
        cy + side * scale * 2.85
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAccretionDisk(cx, cy, scale, frame, rotation, tilt) {
    const all = [];

    state.disk.forEach((particle) => {
      all.push({ ...particle, micro: false });
    });

    const dustStep = qualityStep('dust');
    state.dust.forEach((dust, i) => {
      if (i % dustStep) return;
      all.push({
        r: dust.r,
        angle: dust.angle,
        y: dust.y,
        size: dust.size / 5,
        color: dust.hue === 0 ? 'rgb(251, 146, 60)' : dust.hue === 1 ? 'rgb(236, 72, 153)' : dust.hue === 2 ? 'rgb(103, 232, 249)' : 'rgb(253, 230, 138)',
        rawColor: [1, .6, .2],
        alpha: dust.alpha,
        seed: i * 0.113,
        micro: true
      });
    });

    // Sort by depth so the back side draws first.
    all.sort((a, b) => Math.sin(a.angle + rotation) - Math.sin(b.angle + rotation));

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    all.forEach((p, i) => {
      const localRotation = rotation + frame * (p.micro ? 0.00055 : 0.0002) / Math.max(0.55, p.r);
      const pos = project(p, localRotation, tilt, scale, cx, cy);
      const frontBoost = pos.z < 0 ? 1.3 : 0.55;
      const pulse = 0.65 + Math.sin(frame * 0.045 + p.seed) * 0.25;
      const alpha = (p.alpha || 0.46) * frontBoost * pulse;
      const size = Math.max(0.45, p.size * scale * 0.021 * (pos.z < 0 ? 1.35 : 0.85));

      // Motion streaks along orbital direction for frame-by-frame scroll feel.
      const tangent = pos.angle + Math.PI / 2;
      const streak = p.micro ? 5 : 12;
      ctx.globalAlpha = Math.min(0.88, alpha);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = Math.max(0.35, size * 0.45);
      ctx.beginPath();
      ctx.moveTo(pos.x - Math.cos(tangent) * streak, pos.y - Math.sin(tangent) * streak * 0.18);
      ctx.lineTo(pos.x + Math.cos(tangent) * streak * 0.6, pos.y + Math.sin(tangent) * streak * 0.12);
      ctx.stroke();

      ctx.globalAlpha = Math.min(0.95, alpha * 1.15);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawPhotonRing(cx, cy, coreRadius, frame) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const ringGrad = ctx.createConicGradient(frame * 0.014, cx, cy);
    ringGrad.addColorStop(0, 'rgba(251,146,60,.95)');
    ringGrad.addColorStop(0.22, 'rgba(236,72,153,.72)');
    ringGrad.addColorStop(0.48, 'rgba(6,182,212,.84)');
    ringGrad.addColorStop(0.72, 'rgba(253,230,138,.72)');
    ringGrad.addColorStop(1, 'rgba(251,146,60,.95)');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = Math.max(5, coreRadius * 0.105);
    ctx.globalAlpha = 0.86;
    ctx.beginPath();
    ctx.ellipse(cx, cy, coreRadius * 1.34, coreRadius * 0.44, -0.06, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.34;
    ctx.lineWidth = Math.max(14, coreRadius * 0.22);
    ctx.beginPath();
    ctx.ellipse(cx, cy, coreRadius * 1.56, coreRadius * 0.5, -0.06, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEventHorizon(cx, cy, coreRadius, frame) {
    ctx.save();
    // Outer gravitational glow.
    drawGlowCircle(cx, cy, coreRadius * 2.8, 'rgb(124, 58, 237)', 0.18);
    drawGlowCircle(cx, cy, coreRadius * 2.15, 'rgb(6, 182, 212)', 0.12);

    // Event horizon stays genuinely black.
    const horizon = ctx.createRadialGradient(cx - coreRadius * 0.2, cy - coreRadius * 0.28, 0, cx, cy, coreRadius * 1.05);
    horizon.addColorStop(0, 'rgba(0,0,0,1)');
    horizon.addColorStop(0.58, 'rgba(0,0,0,1)');
    horizon.addColorStop(0.76, 'rgba(2,6,23,.96)');
    horizon.addColorStop(1, 'rgba(15,23,42,.08)');
    ctx.fillStyle = horizon;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Tiny unstable rim details.
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i++) {
      const a = i * 0.241 + frame * 0.018;
      const r = coreRadius * (1.02 + Math.sin(i * 2.1 + frame * 0.04) * 0.025);
      ctx.beginPath();
      ctx.arc(cx, cy, r, a, a + 0.055);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(now) {
    if (window.__BLACKHOLE_MOTION_PAUSED || window.AppState?.get('motion') === 'paused') {
      requestAnimationFrame(render);
      return;
    }
    state.time = now * 0.001;
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.055;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.055;
    state.frame += (state.targetFrame - state.frame) * 0.12;

    ctx.clearRect(0, 0, state.w, state.h);

    const cx = state.w * (state.w > 900 ? 0.68 : 0.5) + state.mouseX * 34;
    const cy = state.h * 0.47 + state.mouseY * 22;
    const scale = Math.min(state.w, state.h) * (state.w > 900 ? 0.165 : 0.145) * (1 + state.scrollProgress * 0.1);
    const frame = state.frame + state.time * 24;
    const discreteFrame = Math.round(state.frame);
    window.AppState?.set({ frame: discreteFrame, modelStatus: 'rendering' }, { persist: false });
    const rotation = discreteFrame * 0.017 + state.time * 0.035;
    const tilt = 1.10 + Math.sin(discreteFrame * 0.012) * 0.10 + state.mouseY * 0.05;
    const coreRadius = Math.max(54, scale * (0.72 + Math.sin(discreteFrame * 0.02) * 0.018));

    // Space wash.
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(state.w, state.h) * 0.9);
    bg.addColorStop(0, 'rgba(15, 23, 42, .05)');
    bg.addColorStop(0.24, 'rgba(88, 28, 135, .08)');
    bg.addColorStop(0.52, 'rgba(8, 47, 73, .06)');
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, state.w, state.h);

    drawBackgroundStars(cx, cy, frame);
    drawJets(cx, cy, scale, frame);
    drawLensingGrid(cx, cy, coreRadius, frame);
    drawAccretionDisk(cx, cy, scale, frame, rotation, tilt);
    drawPhotonRing(cx, cy, coreRadius, frame);
    drawEventHorizon(cx, cy, coreRadius, frame);

    // Scroll frame micro HUD mark in the background, intentionally subtle.
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#67e8f9';
    ctx.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(`BLACKHOLE.GLB FRAME ${String(discreteFrame).padStart(3, '0')}`, 22, state.h - 24);
    ctx.restore();

    requestAnimationFrame(render);
  }

  resize();
  updateScrollFrame();

  fetch('/models/blackhole.glb', { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`blackhole.glb returned ${response.status}`);
      return response.arrayBuffer();
    })
    .then(parseGlb)
    .then((model) => { buildScene(model); window.AppState?.set({ modelStatus: 'loaded', modelFile: 'blackhole.glb' }, { persist: false }); })
    .catch((error) => {
      console.warn('Using fallback blackhole scene:', error);
      buildScene(fallbackModel());
      window.AppState?.set({ modelStatus: 'fallback', modelFile: 'fallback scene' }, { persist: false });
    })
    .finally(() => {
      window.dispatchEvent(new CustomEvent('blackhole:ready'));
      requestAnimationFrame(render);
    });
})();
