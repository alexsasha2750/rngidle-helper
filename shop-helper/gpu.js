// Hands the "Use the discrete GPU" setting to gpu-main.js, which runs in the page's own world and
// cannot read extension storage: it watches this data attribute on the page.
(() => {
  const ATTR = 'data-shop-helper-gpu';
  const set = on => document.documentElement.setAttribute(ATTR, on ? '1' : '0');

  if (typeof chrome === 'undefined' || !chrome.runtime?.id || !chrome.storage?.local) return;
  chrome.storage.local.get('uiPrefs').then(({ uiPrefs }) => set(uiPrefs?.discreteGpu === true)).catch(() => {});
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.uiPrefs) return;
    if (!chrome.runtime?.id) return;
    set(changes.uiPrefs.newValue?.discreteGpu === true);
  });
})();
