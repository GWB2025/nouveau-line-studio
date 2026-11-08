import { createArtwork, renderSvg } from './generator.js';

const DEFAULTS = Object.freeze({
  seed: '20261108', flower: 'mixed', density: 70, curvature: 75,
  hatching: 55, page: 'A6', composition: 'organic', symmetry: 70,
  frame: 'arch', shading: 'contour', scale: 115, margin: 8,
});
const CLASSIC = Object.freeze({
  seed: '2412028838', flower: 'lily', density: 65, curvature: 75,
  hatching: 40, page: 'A6', composition: 'classic', symmetry: 100,
  frame: 'arch', shading: 'contour', scale: 100, margin: 0,
});
const FIELDS = Object.keys(DEFAULTS);
const $ = id => document.getElementById(id);
let artwork;

function currentOptions() {
  return Object.fromEntries(FIELDS.map(name => [name, $(name).value]));
}

function enabledLayers() {
  return [...document.querySelectorAll('input[data-layer]:checked')]
    .map(input => input.dataset.layer);
}

function updatePreview() {
  artwork = createArtwork(currentOptions());
  const visibleLayers = enabledLayers();
  const paths = visibleLayers.flatMap(name => artwork.layers[name]);
  const unitToMm = Math.min(artwork.metrics.pageWidthMm / 300, artwork.metrics.pageHeightMm / 420);
  const shownLengthMm = paths.reduce((sum, path) => sum + path.length, 0) * unitToMm;
  $('preview').innerHTML = renderSvg(artwork, visibleLayers);
  $('path-count').textContent = paths.length.toLocaleString('en-GB');
  $('pen-length').textContent = `${(shownLengthMm / 1000).toFixed(2)} m`;
  $('export').disabled = paths.length === 0;
  $('seed-caption').textContent = artwork.options.seed || '(empty)';
  $('paper-tag').textContent = `${artwork.options.page} · MONOCHROME`;
  $('preview').style.aspectRatio = `${artwork.metrics.pageWidthMm} / ${artwork.metrics.pageHeightMm}`;
  $('fit-info').textContent = `Effective scale: ${artwork.metrics.effectiveScale.toFixed(1)}% · ` +
    `minimum margin: ${artwork.metrics.marginMm} mm. ` +
    'Length shown excludes pen-up travel and acceleration.';
  const classic = artwork.options.composition === 'classic';
  for (const name of ['symmetry', 'frame', 'shading']) $(name).disabled = classic;
  for (const name of ['density', 'curvature', 'hatching', 'symmetry', 'scale']) {
    $(`${name}-value`).textContent = `${artwork.options[name]}%`;
  }
  $('margin-value').textContent = `${artwork.options.margin} mm`;
}

function exportSvg() {
  const content = renderSvg(artwork, enabledLayers());
  const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeSeed = artwork.options.seed.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
  anchor.download = `nouveau-${artwork.options.flower}-${safeSeed}-${artwork.options.page}.svg`;
  anchor.href = url;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('status').textContent = `${anchor.download} exported. Inspect the file in SVG Plotter before a physical plot.`;
}

for (const name of FIELDS) {
  $(name).addEventListener('input', updatePreview);
  $(name).addEventListener('change', updatePreview);
}
for (const input of document.querySelectorAll('input[data-layer]')) {
  input.addEventListener('change', updatePreview);
}
$('randomise').addEventListener('click', () => {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  $('seed').value = String(bytes[0]);
  updatePreview();
});
function loadPreset(values) {
  for (const [name, value] of Object.entries(values)) $(name).value = value;
  for (const input of document.querySelectorAll('input[data-layer]')) input.checked = true;
  updatePreview();
}
$('reset').addEventListener('click', () => loadPreset(DEFAULTS));
$('legacy').addEventListener('click', () => loadPreset(CLASSIC));
$('export').addEventListener('click', exportSvg);
updatePreview();