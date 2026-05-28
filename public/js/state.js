/* Advanced State Layer for the HTMX/EJS portfolio.
   Stores UI, animation, quality, model, and section state in localStorage.
   Other scripts can read window.AppState or listen for `app:state-change`.
*/
(function () {
  const STORAGE_KEY = 'novachain:advanced-state:v1';
  const defaults = {
    motion: 'on',
    quality: 'high',
    activeSection: 'top',
    commandOpen: false,
    modalOpen: false,
    modelStatus: 'loading',
    modelFile: 'blackhole.glb',
    frame: 0,
    scrollProgress: 0,
    walletFeatures: false,
    theme: 'blackhole'
  };

  function load() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return { ...defaults };
    }
  }

  let state = load();
  const subscribers = new Set();

  function persist() {
    const persistent = {
      motion: state.motion,
      quality: state.quality,
      theme: state.theme
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent));
  }

  function emit(patch = {}) {
    document.documentElement.dataset.motion = state.motion;
    document.documentElement.dataset.quality = state.quality;
    document.documentElement.dataset.theme = state.theme;
    window.__BLACKHOLE_MOTION_PAUSED = state.motion === 'paused';
    window.dispatchEvent(new CustomEvent('app:state-change', { detail: { state: { ...state }, patch } }));
    subscribers.forEach((callback) => callback({ ...state }, patch));
    updateStatePanel();
  }

  function set(patch, options = {}) {
    state = { ...state, ...patch };
    if (options.persist !== false) persist();
    emit(patch);
    return { ...state };
  }

  function get(key) {
    return key ? state[key] : { ...state };
  }

  function subscribe(callback) {
    subscribers.add(callback);
    callback({ ...state }, {});
    return () => subscribers.delete(callback);
  }

  function cycleQuality() {
    const order = ['low', 'medium', 'high', 'ultra'];
    const current = order.indexOf(state.quality);
    const next = order[(current + 1) % order.length];
    set({ quality: next });
    return next;
  }

  function toggleMotion() {
    const motion = state.motion === 'paused' ? 'on' : 'paused';
    set({ motion });
    return motion;
  }

  function updateStatePanel() {
    const panel = document.getElementById('advanced-state-panel');
    if (!panel) return;
    const map = {
      'state-motion': state.motion,
      'state-quality': state.quality,
      'state-section': state.activeSection,
      'state-model': state.modelStatus,
      'state-frame': String(Math.round(state.frame)).padStart(3, '0'),
      'state-progress': `${Math.round(state.scrollProgress * 100)}%`,
      'state-wallet': state.walletFeatures ? 'enabled' : 'disabled'
    };
    Object.entries(map).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = value;
    });
  }

  window.AppState = {
    get,
    set,
    subscribe,
    cycleQuality,
    toggleMotion,
    defaults: { ...defaults }
  };

  document.addEventListener('DOMContentLoaded', () => {
    emit({}, { persist: false });
    updateStatePanel();
  });
})();
