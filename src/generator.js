import { SeededRandom } from './prng.js';
import { buildBotanicalComposition } from './botany.js';
import { buildOrganicComposition } from './organic.js';
import { fitPathsToPage } from './layout.js';

const PAPER = Object.freeze({ A4: [210, 297], A5: [148, 210], A6: [105, 148] });
const ORDER = Object.freeze(['frame', 'outlines', 'detail', 'hatching']);
const STROKES = Object.freeze({ frame: 0.42, outlines: 0.56, detail: 0.27, hatching: 0.18 });

function bounded(value, fallback) {
  const number = Number(value);
  return value === '' || !Number.isFinite(number)
    ? fallback : Math.max(0, Math.min(100, Math.round(number)));
}

function ranged(value, fallback, min, max) {
  const number = Number(value);
  return value === '' || !Number.isFinite(number)
    ? fallback : Math.max(min, Math.min(max, Math.round(number)));
}

export function sanitiseOptions(raw = {}) {
  const flower = ['lily', 'poppy', 'iris', 'mixed'].includes(raw.flower) ? raw.flower : 'lily';
  const page = Object.hasOwn(PAPER, raw.page) ? raw.page : 'A4';
  return {
    seed: String(raw.seed ?? '20261107').slice(0, 80),
    flower,
    density: bounded(raw.density, 65),
    curvature: bounded(raw.curvature, 75),
    hatching: bounded(raw.hatching, 40),
    page,
    composition: raw.composition === 'organic' ? 'organic' : 'classic',
    symmetry: bounded(raw.symmetry, 100),
    frame: ['arch', 'halo', 'trellis'].includes(raw.frame) ? raw.frame : 'arch',
    shading: raw.shading === 'crosshatch' ? 'crosshatch' : 'contour',
    scale: ranged(raw.scale, 100, 50, 130),
    margin: ranged(raw.margin, 0, 0, 20),
  };
}

function escapeXml(input) {
  return String(input).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  })[character]);
}

export function createArtwork(rawOptions = {}) {
  const options = sanitiseOptions(rawOptions);
  const rng = new SeededRandom(`${options.seed}|botanical|${options.flower}`);
  const hatchRng = new SeededRandom(`${options.seed}|hatching`);
  const rawLayers = options.composition === 'organic'
    ? buildOrganicComposition(options)
    : buildBotanicalComposition(options, rng, hatchRng);
  const [widthMm, heightMm] = PAPER[options.page];
  const { layers, effectiveScale } = fitPathsToPage(rawLayers,
    widthMm, heightMm, options.scale, options.margin);
  const unitToMm = Math.min(widthMm / 300, heightMm / 420);
  const allPaths = ORDER.flatMap(name => layers[name]);
  return {
    options, layers,
    metrics: {
      pathCount: allPaths.length,
      penDownMm: Math.round(allPaths.reduce((sum, path) => sum + path.length, 0) * unitToMm),
      layerCounts: Object.fromEntries(ORDER.map(name => [name, layers[name].length])),
      pageWidthMm: widthMm, pageHeightMm: heightMm,
      effectiveScale, marginMm: options.margin,
    },
  };
}

export function renderSvg(artwork, enabledLayers = ORDER) {
  const { options, layers, metrics } = artwork;
  const permitted = new Set(enabledLayers);
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.pageWidthMm}mm" height="${metrics.pageHeightMm}mm" viewBox="0 0 300 420" preserveAspectRatio="xMidYMid meet">`,
    `  <title>Nouveau Line Studio — ${escapeXml(options.flower)} ornament</title>`,
    `  <desc>Original seeded vector artwork. Seed: ${escapeXml(options.seed)}. No bitmap images; paths suitable for pen plotting.</desc>`,
  ];
  for (const name of ORDER) {
    if (!permitted.has(name)) continue;
    parts.push(`  <g id="layer-${name}" fill="none" stroke="#111111" stroke-width="${STROKES[name]}" stroke-linecap="round" stroke-linejoin="round">`);
    for (const path of layers[name]) {
      parts.push(`    <path d="${path.d}"/>`);
    }
    parts.push('  </g>');
  }
  parts.push('</svg>');
  return parts.join('\n') + '\n';
}