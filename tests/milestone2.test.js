import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createArtwork, renderSvg, sanitiseOptions } from '../src/generator.js';
import { planBouquet, hatchStrokes } from '../src/composition.js';
import { pathBounds, fitPathsToPage } from '../src/layout.js';

const original = {
  seed: '2412028838', flower: 'lily', density: 65, curvature: 75,
  hatching: 40, page: 'A6',
};
const organic = {
  ...original, composition: 'organic', symmetry: 55, frame: 'halo',
  shading: 'contour', scale: 100, margin: 7,
};

test('Milestone 01 saved output remains exactly reproducible', () => {
  const hash = createHash('sha256').update(renderSvg(createArtwork(original))).digest('hex');
  assert.equal(hash, '192a1ca23727c08535ba5825f8fe84774600803fdb38582c7f90bb0490e5534a');
});

test('new option values validate against explicit enums and numeric bounds', () => {
  const clean = sanitiseOptions({ composition: 'garbage', flower: 'mixed',
    frame: '<script>', shading: 'bad', symmetry: -42, scale: 1000, margin: -3 });
  assert.equal(clean.composition, 'classic');
  assert.equal(clean.flower, 'mixed');
  assert.equal(clean.frame, 'arch');
  assert.equal(clean.shading, 'contour');
  assert.equal(clean.symmetry, 0);
  assert.equal(clean.scale, 130);
  assert.equal(clean.margin, 0);
});

test('organic output is deterministic, layered and distinct from classic', () => {
  const a = createArtwork(organic);
  const b = createArtwork(organic);
  assert.deepEqual(a, b);
  assert.notEqual(renderSvg(a), renderSvg(createArtwork(original)));
  const svg = renderSvg(a);
  assert.match(svg, /width="105mm" height="148mm"/);
  assert.doesNotMatch(svg, /<image|<script|<foreignObject|\bNaN\b|\bInfinity\b|transform=/i);
  assert.ok(a.metrics.pathCount > 100 && a.metrics.pathCount < 900);
});

test('symmetrical bouquets have matched mirrored flower locations', () => {
  const planned = planBouquet('mirror', 100);
  for (const pair of planned.pairs) {
    assert.ok(Math.abs(pair.left.x + pair.right.x - 300) < 1e-8);
    assert.equal(pair.left.y, pair.right.y);
    assert.equal(pair.left.size, pair.right.size);
  }
});

test('reduced symmetry creates controlled, repeatable asymmetry', () => {
  const symmetric = planBouquet('a', 100);
  const free = planBouquet('a', 0);
  assert.notDeepEqual(free.pairs, symmetric.pairs);
  assert.deepEqual(free, planBouquet('a', 0));
});

test('planned flowers avoid heavy overlaps by keeping pair clearances', () => {
  for (let i = 0; i < 30; i += 1) {
    const plan = planBouquet(`seed-${i}`, i % 2 ? 100 : 0);
    const blossoms = [plan.top, ...plan.pairs.flatMap(pair => [pair.left, pair.right])];
    for (let a = 0; a < blossoms.length; a += 1) {
      for (let b = a + 1; b < blossoms.length; b += 1) {
        const first = blossoms[a]; const second = blossoms[b];
        assert.ok(Math.hypot(first.x - second.x, first.y - second.y) >=
          (first.size + second.size) * 0.75, `overlap ${i}:${a}:${b}`);
      }
    }
  }
});

test('hatching keeps minimum spacing and no hatch strokes at zero', () => {
  assert.equal(hatchStrokes(10, 0, 4).length, 0);
  const strokes = hatchStrokes(10, 100, 4);
  assert.ok(strokes.length >= 2);
  for (let i = 1; i < strokes.length; i += 1) {
    assert.ok(strokes[i] - strokes[i - 1] >= 3.999);
  }
});

test('changing shade mode changes hatching but preserves outlines', () => {
  const a = createArtwork({ ...organic, shading: 'contour' });
  const b = createArtwork({ ...organic, shading: 'crosshatch' });
  assert.notDeepEqual(a.layers.hatching, b.layers.hatching);
  for (const name of ['frame', 'outlines', 'detail']) {
    assert.deepEqual(a.layers[name], b.layers[name]);
  }
});

test('each frame option creates a recognisably different frame only', () => {
  // Isolate the style grammar from overall margin-fitting transforms.
  const isolated = { ...organic, scale: 100, margin: 0 };
  const arch = createArtwork({ ...isolated, frame: 'arch' });
  const halo = createArtwork({ ...isolated, frame: 'halo' });
  const trellis = createArtwork({ ...isolated, frame: 'trellis' });
  assert.notDeepEqual(arch.layers.frame, halo.layers.frame);
  assert.notDeepEqual(halo.layers.frame, trellis.layers.frame);
  assert.deepEqual(arch.layers.outlines, halo.layers.outlines);
});

test('new generator supports mixed flowers and different seeded compositions', () => {
  const a = renderSvg(createArtwork({ ...organic, flower: 'mixed' }));
  const b = renderSvg(createArtwork({ ...organic, flower: 'mixed', seed: 'another' }));
  assert.notEqual(a, b);
});

test('fitted vector paths honour physical page margins without SVG transforms', () => {
  const art = createArtwork({ ...organic, scale: 130, margin: 12 });
  const all = Object.values(art.layers).flat();
  const bounds = pathBounds(all);
  const marginX = 12 * 300 / 105;
  const marginY = 12 * 420 / 148;
  assert.ok(bounds.minX >= marginX - 0.05);
  assert.ok(bounds.maxX <= 300 - marginX + 0.05);
  assert.ok(bounds.minY >= marginY - 0.05);
  assert.ok(bounds.maxY <= 420 - marginY + 0.05);
  assert.ok(art.metrics.effectiveScale <= 130);
  assert.doesNotMatch(renderSvg(art), /transform=/);
});

test('scaling alters path sizes and calibrated pen-down length', () => {
  const full = createArtwork({ ...organic, margin: 0, scale: 100 });
  const smaller = createArtwork({ ...organic, margin: 0, scale: 60 });
  assert.notDeepEqual(smaller.layers, full.layers);
  assert.ok(smaller.metrics.penDownMm < full.metrics.penDownMm);
});

test('layout accepts an empty set of paths and preserves source array', () => {
  const empty = { frame: [], outlines: [], detail: [], hatching: [] };
  const done = fitPathsToPage(empty, 105, 148, 70, 8);
  assert.deepEqual(done.layers, empty);
  assert.equal(done.effectiveScale, 70);
});

test('path complexity stays below plotter budget for demanding seeds', () => {
  for (let i = 0; i < 24; i += 1) {
    const art = createArtwork({ ...organic, seed: `complex-${i}`, flower: 'mixed',
      density: 100, hatching: 100, symmetry: (i * 19) % 101,
      frame: ['arch', 'halo', 'trellis'][i % 3],
      shading: i % 2 ? 'crosshatch' : 'contour' });
    assert.ok(art.metrics.pathCount < 900, `${i}: ${art.metrics.pathCount} paths`);
    assert.ok(art.metrics.penDownMm < 30000, `${i}: ${art.metrics.penDownMm} mm`);
  }
});

test('zero-density organic shading leaves the independent outline layers untouched', () => {
  const withInk = createArtwork({ ...organic, hatching: 80, shading: 'crosshatch' });
  const withoutInk = createArtwork({ ...organic, hatching: 0, shading: 'crosshatch' });
  assert.equal(withoutInk.layers.hatching.length, 0);
  for (const name of ['frame', 'outlines', 'detail']) {
    assert.deepEqual(withInk.layers[name], withoutInk.layers[name]);
  }
});

test('crosshatching increases detail without raising maximum path budget', () => {
  const contour = createArtwork({ ...organic, hatching: 100, shading: 'contour' });
  const crossed = createArtwork({ ...organic, hatching: 100, shading: 'crosshatch' });
  assert.ok(crossed.layers.hatching.length > contour.layers.hatching.length);
  assert.ok(crossed.metrics.pathCount < 900);
});