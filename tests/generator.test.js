import test from 'node:test';
import assert from 'node:assert/strict';
import { createArtwork, renderSvg, sanitiseOptions } from '../src/generator.js';

const settings = { seed: '20261107', flower: 'lily', density: 65,
  curvature: 75, hatching: 40, page: 'A4' };

test('generation is exactly reproducible for a given seed and options', () => {
  assert.deepEqual(createArtwork(settings), createArtwork(settings));
});

test('different seeds change the artwork', () => {
  assert.notEqual(renderSvg(createArtwork(settings)),
    renderSvg(createArtwork({ ...settings, seed: 'other-seed' })));
});

test('export is genuine stroked SVG with separated pen layers', () => {
  const art = createArtwork(settings);
  const svg = renderSvg(art);
  assert.match(svg, /width="210mm" height="297mm"/);
  assert.match(svg, /id="layer-frame"/);
  assert.match(svg, /id="layer-outlines"/);
  assert.match(svg, /id="layer-detail"/);
  assert.match(svg, /id="layer-hatching"/);
  assert.match(svg, /<path d="M /);
  assert.doesNotMatch(svg, /<image|data:image|<foreignObject|<script/i);
  assert.doesNotMatch(svg, /\bNaN\b|\bInfinity\b/);
  assert.ok(art.metrics.pathCount > 80);
  assert.ok(art.metrics.pathCount < 900);
  assert.ok(art.metrics.penDownMm > 0);
});

test('smaller format exports the correct physical paper dimensions', () => {
  const art = createArtwork({ ...settings, page: 'A6' });
  assert.match(renderSvg(art), /width="105mm" height="148mm"/);
});

test('hatching control affects hatching alone', () => {
  const zero = createArtwork({ ...settings, hatching: 0 });
  const full = createArtwork({ ...settings, hatching: 100 });
  assert.equal(zero.layers.hatching.length, 0);
  assert.ok(full.layers.hatching.length > 20);
  for (const name of ['frame', 'outlines', 'detail']) {
    assert.deepEqual(zero.layers[name], full.layers[name]);
  }
});

test('unexpected inputs are clamped and seed text is safely escaped', () => {
  const opts = sanitiseOptions({ seed: '<svg onload="bad">', density: 600,
    curvature: -1, hatching: Number.NaN, page: '??' });
  assert.equal(opts.density, 100);
  assert.equal(opts.curvature, 0);
  assert.equal(opts.hatching, 40);
  assert.equal(opts.page, 'A4');
  const svg = renderSvg(createArtwork(opts));
  assert.doesNotMatch(svg, /<svg onload/);
  assert.match(svg, /&lt;svg/);
});

test('SVG path lengths stay within a conservative plotting budget', () => {
  for (let i = 0; i < 20; i += 1) {
    const art = createArtwork({ ...settings, seed: String(i), density: 100,
      hatching: 100 });
    assert.ok(art.metrics.pathCount < 900);
    assert.ok(art.metrics.penDownMm < 100000);
  }
});

test('flower selection alters original vector shapes', () => {
  const lily = renderSvg(createArtwork(settings));
  const poppy = renderSvg(createArtwork({ ...settings, flower: 'poppy' }));
  const iris = renderSvg(createArtwork({ ...settings, flower: 'iris' }));
  assert.notEqual(lily, poppy);
  assert.notEqual(poppy, iris);
});

test('layer selection omits deselected SVG paths and groups', () => {
  const art = createArtwork(settings);
  const svg = renderSvg(art, ['frame', 'outlines']);
  assert.match(svg, /id="layer-frame"/);
  assert.match(svg, /id="layer-outlines"/);
  assert.doesNotMatch(svg, /id="layer-detail"|id="layer-hatching"/);
  const visible = art.layers.frame.length + art.layers.outlines.length;
  assert.equal((svg.match(/<path /g) ?? []).length, visible);
});
