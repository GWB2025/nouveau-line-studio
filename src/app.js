import { createArtwork, renderSvg } from './generator.js';

const DEFAULTS = Object.freeze({ seed: '20261107', flower: 'lily', density: 65,
  curvature: 75, hatching: 40, page: 'A4' });
const FIELDS = ['seed', 'flower', 'density', 'curvature', 'hatching', 'page'];
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
  for (const name of ['density', 'curvature', 'hatching']) {
    $(`${name}-value`).textContent = `${artwork.options[name]}%`;
  }
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
$('reset').addEventListener('click', () => {
  for (const [name, value] of Object.entries(DEFAULTS)) $(name).value = value;
  for (const input of document.querySelectorAll('input[data-layer]')) input.checked = true;
  updatePreview();
});
$('export').addEventListener('click', exportSvg);
updatePreview();
