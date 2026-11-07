import { writeFileSync, mkdirSync } from 'node:fs';
import { createArtwork, renderSvg } from '../src/generator.js';
import assert from 'node:assert/strict';

const artwork = createArtwork({ seed: '20261107', flower: 'lily', density: 65,
  curvature: 75, hatching: 40, page: 'A4' });
const svg = renderSvg(artwork);
assert.equal((svg.match(/<path /g) ?? []).length, artwork.metrics.pathCount);
assert.match(svg, /viewBox="0 0 300 420"/);
assert.ok(artwork.metrics.pathCount < 900);
mkdirSync(new URL('../samples/', import.meta.url), { recursive: true });
writeFileSync(new URL('../samples/nouveau-lily-seed-20261107-A4.svg', import.meta.url), svg);
console.log(`Validated sample SVG: ${artwork.metrics.pathCount} paths, ${(artwork.metrics.penDownMm / 1000).toFixed(2)} m pen-down.`);
