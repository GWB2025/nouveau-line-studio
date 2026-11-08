import { cubicPoint } from './geometry.js';

const NUMBER_OF_SAMPLES = 48;

function instructions(path) {
  const tokens = path.d.trim().split(/\s+/);
  const output = [];
  const widths = { M: 2, L: 2, C: 6 };
  for (let cursor = 0; cursor < tokens.length;) {
    const command = tokens[cursor++];
    const count = widths[command];
    if (!count) throw new Error(`Unexpected path command: ${command}`);
    const values = tokens.slice(cursor, cursor + count).map(Number);
    if (values.length !== count || !values.every(Number.isFinite)) {
      throw new Error('Invalid path coordinate');
    }
    output.push({ command, values });
    cursor += count;
  }
  return output;
}

function pointsOnPath(path, visitor) {
  let previous;
  for (const { command, values } of instructions(path)) {
    const last = { x: values.at(-2), y: values.at(-1) };
    if (command === 'C') {
      if (!previous) throw new Error('Cubic path without starting point');
      const b = { x: values[0], y: values[1] };
      const c = { x: values[2], y: values[3] };
      for (let i = 1; i <= NUMBER_OF_SAMPLES; i += 1) {
        visitor(cubicPoint(previous, b, c, last, i / NUMBER_OF_SAMPLES));
      }
    } else {
      visitor(last);
    }
    previous = last;
  }
}

/** Actual visible path bounds, sampled from Bézier curves rather than control handles. */
export function pathBounds(paths) {
  const result = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const path of paths) {
    pointsOnPath(path, ({ x, y }) => {
      result.minX = Math.min(result.minX, x);
      result.minY = Math.min(result.minY, y);
      result.maxX = Math.max(result.maxX, x);
      result.maxY = Math.max(result.maxY, y);
    });
  }
  return result;
}

function precision(value) {
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

function transformedPath(path, scale, offsetX, offsetY) {
  const d = instructions(path).map(({ command, values }) => {
    const transformed = values.map((v, index) => precision(v * scale +
      (index % 2 ? offsetY : offsetX)));
    return `${command} ${transformed.join(' ')}`;
  }).join(' ');
  return { d, length: path.length * scale };
}

/**
 * Convert requested millimetre margins into design units, then fit the actual
 * path geometry without introducing SVG transforms (for old SVG Plotter builds).
 */
export function fitPathsToPage(layers, pageWidthMm, pageHeightMm, scale = 100, marginMm = 0) {
  const paths = Object.values(layers).flat();
  if (!paths.length || (scale === 100 && marginMm === 0)) {
    return { layers, effectiveScale: scale };
  }
  const bounds = pathBounds(paths);
  const xPad = marginMm * 300 / pageWidthMm;
  const yPad = marginMm * 420 / pageHeightMm;
  const safeWidth = Math.max(5, 300 - xPad * 2);
  const safeHeight = Math.max(5, 420 - yPad * 2);
  // 0.8 design units accommodate path stroke thickness and sampling tolerance.
  const fit = Math.min(safeWidth / (bounds.maxX - bounds.minX + 0.8),
    safeHeight / (bounds.maxY - bounds.minY + 0.8));
  const multiplier = Math.min(scale / 100, fit);
  const offsetX = 150 - (bounds.minX + bounds.maxX) * multiplier / 2;
  const offsetY = 210 - (bounds.minY + bounds.maxY) * multiplier / 2;
  return {
    layers: Object.fromEntries(Object.entries(layers).map(([name, entries]) =>
      [name, entries.map(path => transformedPath(path, multiplier, offsetX, offsetY))])),
    effectiveScale: Math.round(multiplier * 10000) / 100,
  };
}