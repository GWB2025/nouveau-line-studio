import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createArtwork, renderSvg } from '../src/generator.js';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const app = readFileSync(new URL('src/app.js', root), 'utf8');
const validator = readFileSync(new URL('scripts/validate.mjs', root), 'utf8');

const portrait = { composition: 'portrait', seed: '20261108', page: 'A6',
  figurePose: 'three-quarter', gaze: 'lowered', hairstyle: 'waves',
  dress: 'gown', flower: 'lily', frame: 'halo', hatching: 45,
  density: 65, curvature: 75, scale: 110, margin: 8 };

test('new portrait engine is clearly selected and original figure remains available', () => {
  assert.match(html, /value="portrait" selected/);
  assert.match(html, /value="figure">Original figure/);
  assert.match(html, /id="gaze"/);
  assert.match(html, /value="lowered" selected/);
  assert.match(html, /value="direct"/);
  assert.match(html, /value="aside"/);
});

test('gaze, hairstyle and face pose run through the same live redraw path', () => {
  assert.match(app, /'figurePose', 'hairstyle', 'dress', 'gaze'/);
  assert.match(app, /addEventListener\('input', requestPreview\)/);
  assert.match(app, /createFrameUpdater\(updatePreview, requestAnimationFrame\)/);
});

test('published figure sample included in reproducible SVG validation', () => {
  assert.match(validator, /nouveau-portrait-seed-20261108-A6\.svg/);
  const example = readFileSync(new URL('samples/nouveau-portrait-seed-20261108-A6.svg', root), 'utf8');
  assert.equal(example.trimEnd(), renderSvg(createArtwork(portrait)).trimEnd());
  assert.ok((example.match(/<path /g) ?? []).length < 750);
});