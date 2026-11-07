import { SeededRandom } from './prng.js';
import { buildBotanicalComposition } from './botany.js';

const PAPER = Object.freeze({ A4: [210, 297], A5: [148, 210], A6: [105, 148] });
const ORDER = Object.freeze(['frame', 'outlines', 'detail', 'hatching']);
const STROKES = Object.freeze({ frame: 0.42, outlines: 0.56, detail: 0.27, hatching: 0.18 });

function bounded(value, fallback) {
  const number = Number(value);
  return value === '' || !Number.isFinite(number)
    ? fallback : Math.max(0, Math.min(100, Math.round(number)));
}

export function sanitiseOptions(raw = {}) {
  const flower = ['lily', 'poppy', 'iris'].includes(raw.flower) ? raw.flower : 'lily';
  const page = Object.hasOwn(PAPER, raw.page) ? raw.page : 'A4';
  return {
    seed: String(raw.seed ?? '20261107').slice(0, 80),
    flower,
    density: bounded(raw.density, 65),
    curvature: bounded(raw.curvature, 75),
    hatching: bounded(raw.hatching, 40),
    page,
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
  const layers = buildBotanicalComposition(options, rng, hatchRng);
  const [widthMm, heightMm] = PAPER[options.page];
  const unitToMm = Math.min(widthMm / 300, heightMm / 420);
  const allPaths = ORDER.flatMap(name => layers[name]);
  return {
    options, layers,
    metrics: {
      pathCount: allPaths.length,
      penDownMm: Math.round(allPaths.reduce((sum, path) => sum + path.length, 0) * unitToMm),
      layerCounts: Object.fromEntries(ORDER.map(name => [name, layers[name].length])),
      pageWidthMm: widthMm, pageHeightMm: heightMm,
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
