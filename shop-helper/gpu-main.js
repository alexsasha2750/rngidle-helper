// "Use the discrete GPU": while the setting is on, the game's WebGL and WebGPU requests ask the
// browser for the high-performance GPU (powerPreference). It runs in the page's own world before
// the game starts, only on rngidle.fun; it changes what the game asks for and nothing else.
// gpu.js (extension world) switches it with the data attribute below.
(() => {
  const ATTR = 'data-shop-helper-gpu';
  const WEBGL = new Set(['webgl', 'webgl2', 'experimental-webgl']);
  const asObject = value => (value && typeof value === 'object' ? value : {});

  function tune(type, options) {
    return WEBGL.has(type) ? { ...asObject(options), powerPreference: 'high-performance' } : options;
  }
  globalThis.shopHelperGpu = { tune };
  if (typeof document === 'undefined' || !document.documentElement) return;

  const on = () => document.documentElement.getAttribute(ATTR) === '1';

  for (const Canvas of [globalThis.HTMLCanvasElement, globalThis.OffscreenCanvas]) {
    const original = Canvas?.prototype?.getContext;
    if (typeof original !== 'function') continue;
    Canvas.prototype.getContext = function getContext(type, options, ...rest) {
      return original.call(this, type, on() ? tune(type, options) : options, ...rest);
    };
  }

  const gpu = navigator.gpu;
  const request = gpu?.requestAdapter;
  if (typeof request === 'function') {
    gpu.requestAdapter = function requestAdapter(options) {
      return request.call(this, on() ? { ...asObject(options), powerPreference: 'high-performance' } : options);
    };
  }
})();
