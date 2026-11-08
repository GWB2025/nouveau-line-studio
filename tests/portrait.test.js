import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createArtwork, renderSvg, sanitiseOptions } from '../src/generator.js';
import { planPortrait, portraitPoint, eyeLandmarks } from '../src/portrait-landmarks.js';
import { buildPortraitComposition } from '../src/portrait.js';
import { pathBounds } from '../src/layout.js';

const portrait = Object.freeze({
  composition: 'portrait', seed: '20261108', figurePose: 'three-quarter',
  gaze: 'lowered', hairstyle: 'waves', dress: 'gown', flower: 'lily',
  frame: 'halo', density: 65, hatching: 45, curvature: 75,
  shading: 'contour', page: 'A6', scale: 110, margin: 8,
});
const classic = { seed: '2412028838', flower: 'lily', density: 65,
  curvature: 75, hatching: 40, page: 'A6' };
const organic = { seed: '20261108', flower: 'mixed', density: 70,
  curvature: 75, hatching: 55, page: 'A6', composition: 'organic',
  symmetry: 70, frame: 'arch', shading: 'contour', scale: 115, margin: 8 };
const previousFigure = { composition: 'figure', seed: '20261108', flower: 'mixed',
  density: 70, curvature: 75, hatching: 55, page: 'A6',
  figurePose: 'three-quarter', hairstyle: 'waves', dress: 'gown',
  symmetry: 70, frame: 'halo', shading: 'contour', scale: 115, margin: 8 };

function digest(value) { return createHash('sha256').update(value).digest('hex'); }

test('earlier Classic, Organic and Figurative SVGs remain identical', () => {
  assert.equal(digest(renderSvg(createArtwork(classic))),
    '192a1ca23727c08535ba5825f8fe84774600803fdb38582c7f90bb0490e5534a');
  assert.equal(digest(renderSvg(createArtwork(organic))),
    'e676c0452af8753939b0e02c16b028a00b7e33d1fd9b38285d7b11687fd1201f');
  assert.equal(digest(renderSvg(createArtwork(previousFigure))),
    '1947191149100ef12b5c93e7dca217fa3b1f17fc5114022d291848cbc3da8918');
});

test('portrait model is deterministic with realistic face landmark ordering', () => {
  const a = planPortrait('portrait-a', 'three-quarter', 'lowered');
  assert.deepEqual(a, planPortrait('portrait-a', 'three-quarter', 'lowered'));
  assert.ok(a.landmarks.browY < a.landmarks.eyesY);
  assert.ok(a.landmarks.eyesY < a.landmarks.noseY);
  assert.ok(a.landmarks.noseY < a.landmarks.lipsY);
  assert.ok(a.landmarks.lipsY < a.landmarks.chinY);
  const nose = portraitPoint(a, 9, a.landmarks.noseY);
  assert.ok(Number.isFinite(nose.x) && Number.isFinite(nose.y));
  assert.ok(a.faceHeight > 125, 'new expressive study gives face appreciably more room');
});

test('almond eye landmarks distinguish half-lidded and direct gazes', () => {
  const lowered = planPortrait('portrait-a', 'front', 'lowered');
  const direct = planPortrait('portrait-a', 'front', 'direct');
  assert.notDeepEqual(eyeLandmarks(lowered, 'left'), eyeLandmarks(direct, 'left'));
  assert.ok(eyeLandmarks(lowered, 'left').height < eyeLandmarks(direct, 'left').height);
  assert.ok(eyeLandmarks(lowered, 'left').width > 12);
  const aside = planPortrait('portrait-a', 'front', 'aside');
  assert.notEqual(eyeLandmarks(aside, 'right').irisOffset,
    eyeLandmarks(direct, 'right').irisOffset);
});

test('portrait options are sanitised without altering other modes', () => {
  const opts = sanitiseOptions({ composition: 'portrait', gaze: '<script>',
    figurePose: 'bad', hairstyle: 'invalid' });
  assert.equal(opts.composition, 'portrait');
  assert.equal(opts.gaze, 'lowered');
  assert.equal(opts.figurePose, 'three-quarter');
  assert.equal(opts.hairstyle, 'waves');
});

test('expressive portrait output is deterministic layered SVG at true A6', () => {
  const first = createArtwork(portrait);
  assert.deepEqual(first, createArtwork(portrait));
  const svg = renderSvg(first);
  assert.match(svg, /width="105mm" height="148mm"/);
  assert.doesNotMatch(svg, /<image|<script|<foreignObject|transform=|\bNaN\b|\bInfinity\b/i);
  assert.ok(first.metrics.pathCount >= 110 && first.metrics.pathCount < 750);
  assert.ok(first.metrics.penDownMm > 500);
  for (const layer of ['frame', 'outlines', 'detail', 'hatching']) {
    assert.ok(first.layers[layer].length > 0, `missing ${layer}`);
  }
});

test('portrait anatomical variations affect face, not decorative frame', () => {
  const a = buildPortraitComposition(portrait);
  const b = buildPortraitComposition({ ...portrait, gaze: 'aside' });
  assert.deepEqual(a.frame, b.frame);
  assert.deepEqual(a.outlines, b.outlines);
  assert.notDeepEqual(a.detail, b.detail);
});

test('pose alters facial silhouette and gaze remains independently variable', () => {
  const front = buildPortraitComposition({ ...portrait, figurePose: 'front' });
  const turned = buildPortraitComposition(portrait);
  const profile = buildPortraitComposition({ ...portrait, figurePose: 'profile' });
  assert.notDeepEqual(front.outlines, turned.outlines);
  assert.notDeepEqual(turned.outlines, profile.outlines);
  assert.notDeepEqual(front.detail, profile.detail);
});

test('hair and costume controls preserve independent facial landmarks', () => {
  const waves = buildPortraitComposition(portrait);
  const chignon = buildPortraitComposition({ ...portrait, hairstyle: 'updo' });
  const braid = buildPortraitComposition({ ...portrait, hairstyle: 'braid' });
  assert.notDeepEqual(waves.outlines, chignon.outlines);
  assert.notDeepEqual(waves.outlines, braid.outlines);
  assert.notDeepEqual(waves.outlines,
    buildPortraitComposition({ ...portrait, dress: 'shawl' }).outlines);
});

test('hatching is an isolated removable pen layer', () => {
  const withInk = buildPortraitComposition({ ...portrait, hatching: 100 });
  const clear = buildPortraitComposition({ ...portrait, hatching: 0 });
  assert.equal(clear.hatching.length, 0);
  for (const layer of ['frame', 'outlines', 'detail']) {
    assert.deepEqual(clear[layer], withInk[layer]);
  }
});

test('numerous portrait variants remain within A6 plotting margin and budget', () => {
  for (let i = 0; i < 30; i++) {
    const art = createArtwork({ ...portrait, seed: `portrait-${i}`,
      figurePose: ['front', 'three-quarter', 'profile'][i % 3],
      gaze: ['lowered', 'direct', 'aside'][i % 3],
      hairstyle: ['waves', 'updo', 'braid'][i % 3],
      dress: i % 2 ? 'shawl' : 'gown',
      hatching: 100, shading: i % 2 ? 'crosshatch' : 'contour',
      curvature: (i * 13) % 101, scale: 130, margin: 8,
    });
    assert.ok(art.metrics.pathCount < 750, `complexity ${i}: ${art.metrics.pathCount}`);
    assert.ok(art.metrics.penDownMm < 30000, `length ${i}`);
    const bounds = pathBounds(Object.values(art.layers).flat());
    const marginX = 8 * 300 / 105, marginY = 8 * 420 / 148;
    assert.ok(bounds.minX >= marginX - 0.05, `min x: ${i}`);
    assert.ok(bounds.maxX <= 300-marginX + 0.05, `max x: ${i}`);
    assert.ok(bounds.minY >= marginY - 0.05, `min y: ${i}`);
    assert.ok(bounds.maxY <= 420-marginY + 0.05, `max y: ${i}`);
  }
});