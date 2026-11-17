import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeUiPrefs } from '../ui-prefs.js';

delete globalThis.document;
await import('../gpu-main.js');
const { tune } = globalThis.shopHelperGpu;

test('WebGL contexts are asked for the high-performance GPU, other contexts are left alone', () => {
  for (const type of ['webgl', 'webgl2', 'experimental-webgl']) {
    assert.deepEqual(tune(type, undefined), { powerPreference: 'high-performance' });
    assert.deepEqual(tune(type, { alpha: false, powerPreference: 'low-power' }), { alpha: false, powerPreference: 'high-performance' });
  }
  assert.equal(tune('2d', { alpha: false }).powerPreference, undefined);
  assert.deepEqual(tune('2d', { alpha: false }), { alpha: false });
  const mine = { antialias: true };
  tune('webgl', mine);
  assert.deepEqual(mine, { antialias: true }, 'the game\'s own options object is not modified');
});

test('the setting is an opt-in and the scripts load before the game, only on the game site', () => {
  assert.equal(normalizeUiPrefs(undefined).discreteGpu, false);
  assert.equal(normalizeUiPrefs({ discreteGpu: true }).discreteGpu, true);
  assert.equal(normalizeUiPrefs({ discreteGpu: 'yes' }).discreteGpu, false);
  const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
  const main = manifest.content_scripts.find(script => script.js.includes('gpu-main.js'));
  const bridge = manifest.content_scripts.find(script => script.js.includes('gpu.js'));
  assert.equal(main.world, 'MAIN');
  assert.equal(main.run_at, 'document_start', 'it has to be in place before the game makes its canvas');
  assert.equal(bridge.run_at, 'document_start');
  assert.deepEqual(main.matches, ['https://rngidle.fun/*']);
  assert.deepEqual(bridge.matches, ['https://rngidle.fun/*']);
  assert.ok(fs.readFileSync(new URL('../popup.html', import.meta.url), 'utf8').includes('id="discrete-gpu"'));
});
