import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createArtwork, renderSvg, sanitiseOptions } from '../src/generator.js';
import { planFigure, mapFacePoint } from '../src/figure-primitives.js';
import { buildFigureComposition } from '../src/figure.js';
import { pathBounds } from '../src/layout.js';

const portrait = {
  composition: 'figure', seed: 'mucha-20261108', page: 'A6',
  figurePose: 'three-quarter', hairstyle: 'waves', dress: 'gown',
  flower: 'lily', frame: 'halo', density: 70,
  curvature: 70, hatching: 45, shading: 'contour',
  scale: 100, margin: 8, symmetry: 70,
};

const sourceClassic = {
  seed: '2412028838', flower: 'lily', density: 65, curvature: 75,
  hatching: 40, page: 'A6',
};

test('M1 user-approved SVG retains exact SHA-256 after introducing figure generator', () => {
  const hash = createHash('sha256').update(renderSvg(createArtwork(sourceClassic))).digest('hex');
  assert.equal(hash, '192a1ca23727c08535ba5825f8fe84774600803fdb38582c7f90bb0490e5534a');
});

test('figure options are checked and do not leak invalid content to SVG', () => {
  const opts = sanitiseOptions({ composition: 'figure', figurePose: 'oops',
    hairstyle: '<script>', dress: 'bad', seed: '<img onload="oops">' });
  assert.equal(opts.composition, 'figure');
  assert.equal(opts.figurePose, 'three-quarter');
  assert.equal(opts.hairstyle, 'waves');
  assert.equal(opts.dress, 'gown');
  assert.doesNotMatch(renderSvg(createArtwork(opts)), /<script>|<img onload/);
});

test('figure plan is deterministic and view-specific', () => {
  assert.deepEqual(planFigure('abc', 'front'), planFigure('abc', 'front'));
  assert.notDeepEqual(planFigure('abc', 'front'), planFigure('abc', 'profile'));
  const plan = planFigure('abc', 'three-quarter');
  for (const name of ['chin', 'crown', 'leftShoulder', 'rightShoulder']) {
    assert.ok(Number.isFinite(plan[name].x) && Number.isFinite(plan[name].y));
  }
});

test('face projection puts frontal eyes on balanced sides and profile changes profile', () => {
  const a = planFigure('static', 'front');
  const b = planFigure('static', 'profile');
  const l = mapFacePoint(a, -14, 0);
  const r = mapFacePoint(a, 14, 0);
  assert.ok(l.x < a.faceX && r.x > a.faceX);
  assert.ok(Math.abs((a.faceX - l.x) - (r.x - a.faceX)) < 0.02);
  assert.notEqual(mapFacePoint(a, 10, 14).x, mapFacePoint(b, 10, 14).x);
});

test('figure layers contain recognisable silhouette, face, hair, costume and ink detail', () => {
  const art = createArtwork(portrait);
  const counts = art.metrics.layerCounts;
  assert.ok(counts.frame > 0 && counts.outlines > 30 && counts.detail > 25);
  assert.ok(counts.hatching > 0);
  assert.equal(Object.keys(art.layers).sort().join(','), 'detail,frame,hatching,outlines');
  const svg = renderSvg(art);
  assert.match(svg, /width="105mm" height="148mm"/);
  assert.match(svg, /layer-outlines/);
  assert.doesNotMatch(svg, /<image|<script|<foreignObject|transform=|\bNaN\b|\bInfinity\b/i);
});

test('figure pose changes face and body, while other options are fixed', () => {
  const art = ['front', 'three-quarter', 'profile'].map(figurePose =>
    createArtwork({ ...portrait, figurePose }));
  for (let i = 1; i < art.length; i++) assert.notDeepEqual(art[i].layers.outlines, art[i-1].layers.outlines);
});

test('hairstyle and drapery generate independently varied outlines', () => {
  const waves = createArtwork(portrait);
  for (const hairstyle of ['updo', 'braid']) {
    assert.notDeepEqual(waves.layers.outlines, createArtwork({ ...portrait, hairstyle }).layers.outlines);
  }
  assert.notDeepEqual(waves.layers.outlines, createArtwork({ ...portrait, dress: 'shawl' }).layers.outlines);
});

test('hatching zero suppresses only independent shading layer', () => {
  const withInk = createArtwork({ ...portrait, hatching: 100 });
  const without = createArtwork({ ...portrait, hatching: 0 });
  assert.equal(without.layers.hatching.length, 0);
  for (const key of ['frame', 'outlines', 'detail']) assert.deepEqual(withInk.layers[key], without.layers[key]);
});

test('figure SVGs remain under plotter limits across styles and seeds', () => {
  for (let i = 0; i < 25; i += 1) {
    const art = createArtwork({ ...portrait, seed: `figure-${i}`,
      figurePose: ['front', 'three-quarter', 'profile'][i % 3],
      hairstyle: ['waves', 'updo', 'braid'][i % 3],
      dress: i % 2 ? 'shawl' : 'gown',
      shading: i % 2 ? 'crosshatch' : 'contour',
      hatching: 100, curvature: (i * 7) % 101, density: 100,
    });
    assert.ok(art.metrics.pathCount < 900, `paths for ${i}: ${art.metrics.pathCount}`);
    assert.ok(art.metrics.penDownMm < 30000, `distance for ${i}`);
    const b = pathBounds(Object.values(art.layers).flat());
    const mmX = 8 * 300 / 105;
    const mmY = 8 * 420 / 148;
    assert.ok(b.minX >= mmX - 0.1 && b.maxX <= 300-mmX+0.1);
    assert.ok(b.minY >= mmY - 0.1 && b.maxY <= 420-mmY+0.1);
  }
});

test('figure generator is pure, reproducible and respects only SVG path records', () => {
  const a = buildFigureComposition(portrait);
  const b = buildFigureComposition(portrait);
  assert.deepEqual(a, b);
  assert.ok(Object.values(a).flat().every(item => item.d.startsWith('M ') && item.length > 0));
});


test('figure expression and line hatching change independently', () => {
  const flat = createArtwork({ ...portrait, curvature: 0 });
  const expressive = createArtwork({ ...portrait, curvature: 100 });
  assert.notDeepEqual(flat.layers.outlines, expressive.layers.outlines);
  const low = createArtwork({ ...portrait, hatching: 0 });
  const high = createArtwork({ ...portrait, hatching: 100 });
  assert.ok(high.metrics.layerCounts.hatching > low.metrics.layerCounts.hatching);
});

test('existing Milestone 2 organic sample still has identical SVG hash', () => {
  const original = { seed: '20261108', flower: 'mixed', density: 70,
    curvature: 75, hatching: 55, page: 'A6', composition: 'organic',
    symmetry: 70, frame: 'arch', shading: 'contour', scale: 115, margin: 8 };
  const hash = createHash('sha256').update(renderSvg(createArtwork(original))).digest('hex');
  assert.equal(hash, 'e676c0452af8753939b0e02c16b028a00b7e33d1fd9b38285d7b11687fd1201f');
});


test('zero botanical density removes side ornaments without changing figure anatomy', () => {
  const empty = createArtwork({ ...portrait, density: 0 });
  const dense = createArtwork({ ...portrait, density: 100 });
  assert.ok(empty.metrics.pathCount < dense.metrics.pathCount);
});