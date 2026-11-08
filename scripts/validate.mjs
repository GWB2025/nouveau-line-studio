import { writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createArtwork, renderSvg } from '../src/generator.js';
import { pathBounds } from '../src/layout.js';

const samples = [
  {
    filename: 'nouveau-lily-seed-20261107-A4.svg',
    options: { seed: '20261107', flower: 'lily', density: 65,
      curvature: 75, hatching: 40, page: 'A4' },
  },
  {
    filename: 'nouveau-mixed-seed-20261108-A6.svg',
    options: { seed: '20261108', flower: 'mixed', density: 70,
      curvature: 75, hatching: 55, page: 'A6', composition: 'organic',
      symmetry: 70, frame: 'arch', shading: 'contour', scale: 115, margin: 8 },
  },
  {
    filename: 'nouveau-figure-seed-20261108-A6.svg',
    options: { composition: 'figure', seed: '20261108', page: 'A6',
      figurePose: 'three-quarter', hairstyle: 'waves', dress: 'gown',
      flower: 'lily', frame: 'halo', density: 65, curvature: 70,
      hatching: 45, shading: 'contour', scale: 100, margin: 8, symmetry: 70 },
  },
];
mkdirSync(new URL('../samples/', import.meta.url), { recursive: true });
for (const sample of samples) {
  const art = createArtwork(sample.options);
  const svg = renderSvg(art);
  assert.equal((svg.match(/<path /g) ?? []).length, art.metrics.pathCount);
  assert.match(svg, /viewBox="0 0 300 420"/);
  assert.ok(art.metrics.pathCount < 900);
  assert.ok(art.metrics.penDownMm < 30000);
  assert.doesNotMatch(svg, /<image|transform=|<script/);
  if (art.options.margin > 0) {
    const bounds = pathBounds(Object.values(art.layers).flat());
    const mX = art.options.margin * 300 / art.metrics.pageWidthMm;
    const mY = art.options.margin * 420 / art.metrics.pageHeightMm;
    assert.ok(bounds.minX >= mX - 0.05 && bounds.maxX <= 300 - mX + 0.05);
    assert.ok(bounds.minY >= mY - 0.05 && bounds.maxY <= 420 - mY + 0.05);
  }
  writeFileSync(new URL(`../samples/${sample.filename}`, import.meta.url), svg);
  console.log(`Validated ${sample.filename}: ${art.metrics.pathCount} paths, ` +
    `${(art.metrics.penDownMm / 1000).toFixed(2)} m drawn.`);
}