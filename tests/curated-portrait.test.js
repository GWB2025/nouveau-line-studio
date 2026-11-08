import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createArtwork, renderSvg, sanitiseOptions } from '../src/generator.js';
import { buildMusePortrait, PORTRAIT_CATALOGUE } from '../src/portrait-muse.js';
import { buildCuratedComposition } from '../src/curated.js';
import { pathBounds } from '../src/layout.js';

const options = Object.freeze({ composition: 'curated', portraitId: 'muse-01',
  seed: '20261108', page: 'A6', flower: 'lily', frame: 'halo',
  density: 65, hatching: 45, scale: 100, margin: 7 });

test('curated portrait catalogue has one genuinely implemented, identifiable asset', () => {
  assert.equal(PORTRAIT_CATALOGUE.length, 1);
  assert.equal(PORTRAIT_CATALOGUE[0].id, 'muse-01');
  assert.ok(PORTRAIT_CATALOGUE[0].label.includes('Muse'));
  assert.ok(PORTRAIT_CATALOGUE[0].reference.includes('Sarah Bernhardt'));
});

test('source portrait is a vector drawing with separate face and hair strokes', () => {
  const art = buildMusePortrait();
  assert.ok(art.outlines.length >= 25);
  assert.ok(art.detail.length >= 40);
  assert.ok(art.hatching.length >= 15);
  assert.equal(art.frame.length, 0);
  assert.ok(Object.values(art).flat().every(p => /^M [-\d.]+ [-\d.]+/.test(p.d)));
  assert.ok(Object.values(art).flat().every(p => Number.isFinite(p.length) && p.length > 0));
});

test('curated mode selects only implemented portrait and rejects malformed IDs', () => {
  assert.equal(sanitiseOptions(options).portraitId, 'muse-01');
  assert.equal(sanitiseOptions({ ...options, portraitId: '<script>' }).portraitId, 'muse-01');
  assert.equal(sanitiseOptions({ ...options, portraitId: 'muse-06' }).portraitId, 'muse-01');
});

test('portrait face and hair remain identical under seed and ornament changes', () => {
  const a = buildCuratedComposition(options);
  const b = buildCuratedComposition({ ...options, seed: 'different',
    flower: 'iris', density: 95, frame: 'trellis' });
  assert.deepEqual(a.outlines, b.outlines);
  assert.deepEqual(a.detail, b.detail);
  assert.notDeepEqual(a.frame, b.frame);
});

test('seeded ornament is reproducible but varies with seed', () => {
  const a = renderSvg(createArtwork(options));
  const b = renderSvg(createArtwork(options));
  const c = renderSvg(createArtwork({ ...options, seed: '20261109' }));
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test('curated output is real pen paths, layered and inside A6 margins', () => {
  const a = createArtwork(options);
  const svg = renderSvg(a);
  assert.match(svg, /width="105mm" height="148mm"/);
  assert.match(svg, /id="layer-frame"/);
  assert.match(svg, /id="layer-outlines"/);
  assert.match(svg, /id="layer-detail"/);
  assert.match(svg, /id="layer-hatching"/);
  assert.doesNotMatch(svg, /<image|<text|<script|<foreignObject|<use|transform=/i);
  assert.ok(a.metrics.pathCount > 80 && a.metrics.pathCount < 600);
  assert.ok(a.metrics.penDownMm > 1000 && a.metrics.penDownMm < 20000);
  const b=pathBounds(Object.values(a.layers).flat());
  const x=options.margin*300/105, y=options.margin*420/148;
  assert.ok(b.minX >= x - 0.05 && b.maxX <= 300 - x + 0.05);
  assert.ok(b.minY >= y - 0.05 && b.maxY <= 420 - y + 0.05);
});

test('turning hatching off leaves curated face paths unchanged', () => {
  const a=buildCuratedComposition({...options,hatching:0});
  const b=buildCuratedComposition({...options,hatching:100});
  assert.equal(a.hatching.length, 0);
  assert.deepEqual(a.outlines,b.outlines);
  assert.deepEqual(a.detail,b.detail);
});

test('legacy original SVG output is unchanged when curated mode is added', () => {
  const classics = { seed:'2412028838',flower:'lily',density:65,curvature:75,hatching:40,page:'A6' };
  const h=createHash('sha256').update(renderSvg(createArtwork(classics))).digest('hex');
  assert.equal(h,'192a1ca23727c08535ba5825f8fe84774600803fdb38582c7f90bb0490e5534a');
});

test('up to 24 decorative seeds fit the plotter budget', () => {
  for(let i=0;i<24;i++){
    const a=createArtwork({...options,seed:`curated-${i}`,flower:['lily','iris','poppy','mixed'][i%4],frame:['arch','halo','trellis'][i%3],density:100,hatching:100});
    assert.ok(a.metrics.pathCount<600, `path budget seed ${i}`);
    assert.ok(a.metrics.penDownMm<20000, `distance seed ${i}`);
  }
});

test('physical A6 face remains fixed across generative ornament seed changes', () => {
  const a = createArtwork(options);
  const b = createArtwork({ ...options, seed: 'another-seed', flower: 'poppy' });
  assert.deepEqual(a.layers.outlines, b.layers.outlines);
  assert.deepEqual(a.layers.detail, b.layers.detail);
});

test('standalone portrait asset is the same fixed vector geometry as source code', () => {
  const svg = readFileSync(new URL('../assets/portraits/muse-01.svg', import.meta.url), 'utf8');
  const a = buildMusePortrait();
  assert.equal((svg.match(/<path /g) ?? []).length, Object.values(a).flat().length);
  assert.doesNotMatch(svg, /<image|<use|<script|<text|transform=/i);
  assert.match(svg, /id="layer-outlines"/);
  assert.match(svg, /id="layer-detail"/);
});

test('browser offers only ready curated portrait and includes it in live redraw', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(html, /value="curated" selected/);
  assert.match(html, /id="portraitId"/);
  assert.match(html, /value="muse-01" selected/);
  assert.doesNotMatch(html, /value="muse-0[2-6]"/);
  assert.match(app, /'portraitId'/);
  assert.match(app, /'input', requestPreview/);
});