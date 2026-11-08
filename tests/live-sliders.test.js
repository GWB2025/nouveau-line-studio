import test from 'node:test';
import assert from 'node:assert/strict';
import { createArtwork, renderSvg } from '../src/generator.js';
import { createFrameUpdater } from '../src/live-controls.js';

const configuration = {
  composition: 'organic', seed: '20261108', flower: 'mixed',
  page: 'A6', frame: 'arch', density: 70, curvature: 75,
  hatching: 55, shading: 'contour', scale: 115, margin: 8,
  symmetry: 70,
};

test('organic curvature changes visible botanical geometry at every 5% step', () => {
  const variants = Array.from({ length: 21 }, (_, i) =>
    createArtwork({ ...configuration, curvature: i * 5, margin: 0, scale: 100 }));
  for (let i = 1; i < variants.length; i += 1) {
    assert.notDeepEqual(variants[i].layers.outlines, variants[i - 1].layers.outlines,
      `curve expression ${i * 5}% should change botanical outlines`);
  }
  assert.deepEqual(variants[0].layers.frame, variants[20].layers.frame,
    'changing a flower curve must not alter the decorative frame');
  assert.ok(Math.abs(variants[0].metrics.penDownMm - variants[20].metrics.penDownMm) > 20,
    'end points should be noticeably different, not just rounded noise');
});

test('organic hatching changes drawn line geometry at every 5% step', () => {
  const variants = Array.from({ length: 21 }, (_, i) =>
    createArtwork({ ...configuration, hatching: i * 5, margin: 0, scale: 100 }));
  assert.equal(variants[0].layers.hatching.length, 0);
  for (let i = 1; i < variants.length; i += 1) {
    assert.notEqual(renderSvg(variants[i]), renderSvg(variants[i - 1]),
      `hatching at ${i * 5}% should change SVG even when path count is unchanged`);
    assert.ok(variants[i].layers.hatching.length >= variants[i - 1].layers.hatching.length,
      'hatch line counts should not fall when density is increased');
  }
  assert.ok(variants[20].layers.hatching.length >= variants[11].layers.hatching.length * 1.35,
    '100% should be visibly more densely hatched than the default 55%');
  for (const layer of ['frame', 'outlines', 'detail']) {
    assert.deepEqual(variants[0].layers[layer], variants[20].layers[layer],
      `changing shading must not change independent ${layer} geometry`);
  }
});

test('frame updates redraw on next animation frame and use latest slider value', () => {
  const frames = [];
  let controlValue = 25;
  const rendered = [];
  const request = createFrameUpdater(() => rendered.push(controlValue), fn => frames.push(fn));
  request();
  controlValue = 50;
  request();
  controlValue = 75;
  request();
  assert.equal(frames.length, 1, 'rapid input events must coalesce into one frame');
  frames.shift()();
  assert.deepEqual(rendered, [75], 'next frame must render the latest control value');
  controlValue = 100;
  request();
  assert.equal(frames.length, 1, 'subsequent input must request a fresh frame');
  frames.shift()();
  assert.deepEqual(rendered, [75, 100]);
});

test('each slider is wired to live input events, not release-only change events', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /addEventListener\('input', requestPreview\)/);
  assert.match(source, /createFrameUpdater\(updatePreview, requestAnimationFrame\)/);
});


test('organic hatching is visible in preview without changing Classic export', () => {
  const modern = renderSvg(createArtwork(configuration));
  assert.match(modern, /id="layer-hatching"[^>]+stroke-width="0\.48"/);
  const classic = renderSvg(createArtwork({ ...configuration, composition: 'classic' }));
  assert.match(classic, /id="layer-hatching"[^>]+stroke-width="0\.18"/);
});

test('app redraws both SVG sliders on input before change or mouse release', async () => {
  const oldDocument = globalThis.document;
  const oldRequestFrame = globalThis.requestAnimationFrame;
  const frames = [];
  const names = [
    'seed', 'flower', 'density', 'curvature', 'hatching', 'page',
    'composition', 'symmetry', 'frame', 'shading', 'scale', 'margin',
    'figurePose', 'hairstyle', 'dress', 'gaze', 'portraitId', 'artwork-title',
    'preview', 'path-count', 'pen-length', 'export', 'seed-caption',
    'paper-tag', 'fit-info', 'density-value', 'curvature-value',
    'hatching-value', 'symmetry-value', 'scale-value', 'margin-value',
    'randomise', 'reset', 'legacy', 'status',
  ];
  const values = Object.fromEntries(names.map(name => [name, {
    value: String(configuration[name] ?? ''),
    textContent: '', innerHTML: '', style: {}, disabled: false,
    listeners: {},
    addEventListener(event, fn) { this.listeners[event] = fn; },
  }]));
  const layers = ['frame', 'outlines', 'detail', 'hatching'].map(name => ({
    checked: true, dataset: { layer: name }, listeners: {},
    addEventListener(event, fn) { this.listeners[event] = fn; },
  }));
  globalThis.document = {
    getElementById: name => values[name],
    querySelectorAll: selector => selector === 'input[data-layer]:checked'
      ? layers.filter(layer => layer.checked) : layers,
  };
  globalThis.requestAnimationFrame = fn => { frames.push(fn); };
  try {
    await import('../src/app.js?live-render-test');
    const original = values.preview.innerHTML;
    values.curvature.value = '0';
    values.curvature.listeners.input();
    assert.equal(frames.length, 1);
    frames.shift()();
    assert.equal(values['curvature-value'].textContent, '0%');
    assert.notEqual(values.preview.innerHTML, original);

    const curved = values.preview.innerHTML;
    values.hatching.value = '100';
    values.hatching.listeners.input();
    assert.equal(frames.length, 1);
    frames.shift()();
    assert.equal(values['hatching-value'].textContent, '100%');
    assert.notEqual(values.preview.innerHTML, curved);

    const shade = layers.find(layer => layer.dataset.layer === 'hatching');
    shade.checked = false;
    shade.listeners.change();
    frames.shift()();
    assert.equal(values.hatching.disabled, true,
      'shading slider must be disabled if its drawing layer is hidden');
  } finally {
    if (oldDocument === undefined) delete globalThis.document;
    else globalThis.document = oldDocument;
    if (oldRequestFrame === undefined) delete globalThis.requestAnimationFrame;
    else globalThis.requestAnimationFrame = oldRequestFrame;
  }
});