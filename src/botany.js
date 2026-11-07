import { Path, ellipsePath, localPoint } from './geometry.js';

function add(layers, name, path) {
  if (path.length > 0) layers[name].push({ d: path.d, length: path.length });
}

function curvingStem(layers, points) {
  const path = new Path().moveTo(...points[0]);
  for (let i = 1; i < points.length; i += 3) {
    path.cubicTo(...points[i], ...points[i + 1], ...points[i + 2]);
  }
  add(layers, 'outlines', path);
}

function decorativeFrame(layers) {
  for (const inset of [0, 7]) {
    const x = 33 + inset;
    const right = 300 - x;
    add(layers, 'frame', new Path().moveTo(x, 354)
      .cubicTo(x - 15, 255, x - 19, 145, 63 + inset, 88)
      .cubicTo(88, 42 + inset, 113, 35 + inset, 150, 33 + inset)
      .cubicTo(187, 35 + inset, 212, 42 + inset, 237 - inset, 88)
      .cubicTo(right + 19, 145, right + 15, 255, right, 354));
  }

  add(layers, 'frame', ellipsePath(150, 204, 63, 111));
  add(layers, 'frame', ellipsePath(150, 204, 59, 107));

  add(layers, 'frame', new Path().moveTo(33, 354)
    .cubicTo(75, 379, 110, 380, 150, 368)
    .cubicTo(190, 380, 225, 379, 267, 354));
  add(layers, 'frame', new Path().moveTo(46, 369)
    .cubicTo(90, 401, 127, 390, 150, 382)
    .cubicTo(173, 390, 210, 401, 254, 369));

  for (const side of [-1, 1]) {
    const x = side < 0 ? 32 : 268;
    add(layers, 'detail', ellipsePath(x, 358, 4.1, 4.1));
    add(layers, 'detail', ellipsePath(x, 358, 1.5, 1.5));
    add(layers, 'detail', new Path().moveTo(150 + side * 8, 377)
      .cubicTo(150 + side * 12, 398, 150 + side * 31, 401, 150 + side * 35, 391));
  }
  add(layers, 'detail', ellipsePath(150, 374, 5.5, 6.5));
}

function drawLeaf(layers, x, y, direction, size, fullness) {
  const width = size * (0.23 + 0.12 * fullness);
  const p = (u, v) => localPoint(x, y, direction, u, v);
  const a = p(0, 0);
  const b = p(size, 0);
  const upper1 = p(size * 0.25, -width);
  const upper2 = p(size * 0.73, -width * 1.1);
  const lower1 = p(size * 0.78, width * 0.91);
  const lower2 = p(size * 0.25, width * 1.16);

  add(layers, 'outlines', new Path().moveTo(a.x, a.y)
    .cubicTo(upper1.x, upper1.y, upper2.x, upper2.y, b.x, b.y)
    .cubicTo(lower1.x, lower1.y, lower2.x, lower2.y, a.x, a.y));

  const m1 = p(size * 0.3, 0);
  const m2 = p(size * 0.7, 0);
  add(layers, 'detail', new Path().moveTo(a.x, a.y)
    .cubicTo(m1.x, m1.y, m2.x, m2.y, b.x, b.y));
}

function drawFlower(layers, cx, cy, size, variant, spin, rng) {
  const petals = variant === 'poppy' ? 5 : variant === 'iris' ? 6 : 6;
  const baseWidth = variant === 'poppy' ? 0.64 : variant === 'iris' ? 0.38 : 0.32;

  for (let index = 0; index < petals; index += 1) {
    const angle = spin + (2 * Math.PI * index) / petals;
    const radius = size * rng.between(0.89, 1.12) * (variant === 'iris' && index % 2 ? 0.79 : 1);
    const width = radius * baseWidth;
    const p = (u, v) => localPoint(cx, cy, angle, u, v);
    const origin = p(3, 0);
    const tip = p(radius, 0);
    const a = p(radius * 0.22, -width * 0.8);
    const b = p(radius * 0.7, -width * 1.15);
    const c = p(radius * 0.72, width * 1.14);
    const d = p(radius * 0.21, width * 0.78);
    add(layers, 'outlines', new Path().moveTo(origin.x, origin.y)
      .cubicTo(a.x, a.y, b.x, b.y, tip.x, tip.y)
      .cubicTo(c.x, c.y, d.x, d.y, origin.x, origin.y));

    const v0 = p(5, 0);
    const v1 = p(radius * 0.45, 0);
    const v2 = p(radius * 0.8, 0);
    add(layers, 'detail', new Path().moveTo(v0.x, v0.y)
      .cubicTo(v1.x, v1.y, v2.x, v2.y, tip.x, tip.y));
  }

  add(layers, 'outlines', ellipsePath(cx, cy, size * 0.13, size * 0.13));
  for (let i = 0; i < 5; i += 1) {
    const angle = spin + (Math.PI * 2 * i) / 5;
    const end = localPoint(cx, cy, angle, size * 0.25, 0);
    const middle = localPoint(cx, cy, angle + 0.17, size * 0.18, 0);
    add(layers, 'detail', new Path().moveTo(cx, cy)
      .cubicTo(middle.x, middle.y, middle.x, middle.y, end.x, end.y));
    add(layers, 'detail', ellipsePath(end.x, end.y, 0.75, 1.05));
  }
}

function sideVines(layers, options, rng) {
  const count = 5 + Math.round(options.density / 13);
  const curvature = options.curvature / 100;
  for (const side of [-1, 1]) {
    const mirror = side < 0 ? 1 : -1;
    const originX = side < 0 ? 49 : 251;
    const stemX = y => originX + mirror * (Math.sin(y * (0.018 + curvature * 0.018)) * (5 + 11 * curvature));
    const startX = stemX(350);
    const midX = stemX(235);
    const endX = stemX(100);
    curvingStem(layers, [
      [startX, 350],
      [startX - mirror * 22, 295], [midX + mirror * 10, 260], [midX, 235],
      [midX - mirror * 14, 195], [endX + mirror * 13, 137], [endX, 100],
    ]);
    add(layers, 'detail', new Path().moveTo(startX + mirror * 4, 341)
      .cubicTo(startX - mirror * 11, 272, midX + mirror * 17, 194, endX + mirror * 5, 116));

    for (let i = 0; i < count; i += 1) {
      const y = 336 - i * 229 / (count - 1);
      const x = stemX(y);
      const direction = (i % 2 ? 1 : -1) * mirror;
      const leafAngle = direction > 0 ? -0.62 : -2.50;
      drawLeaf(layers, x, y, leafAngle + rng.between(-0.18, 0.18),
        rng.between(17, 27), curvature);
      if (i % 3 === 1) {
        const next = localPoint(x, y, leafAngle, rng.between(17, 26));
        const size = rng.between(6, 10);
        add(layers, 'detail', new Path().moveTo(x, y)
          .cubicTo(next.x, y - 5, next.x, next.y + 6, next.x, next.y));
        add(layers, 'outlines', ellipsePath(next.x, next.y, size * 0.38, size * 0.65));
      }
    }
  }
}

function centralBouquet(layers, options, rng) {
  // Three stems, drawn before blossoms so their junctions sit behind the flowers.
  add(layers, 'outlines', new Path().moveTo(145, 319)
    .cubicTo(133, 273, 153, 234, 147, 169));
  add(layers, 'outlines', new Path().moveTo(145, 319)
    .cubicTo(122, 278, 108, 252, 116, 222));
  add(layers, 'outlines', new Path().moveTo(145, 319)
    .cubicTo(167, 269, 186, 257, 187, 215));

  const foliage = [
    [139, 268, -2.45, 27], [150, 249, -0.54, 28],
    [140, 224, -2.58, 22], [151, 202, -0.75, 23],
    [119, 262, -2.36, 18], [126, 281, -0.75, 20],
    [172, 266, -2.34, 21], [178, 239, -0.52, 19],
  ];
  for (const [x, y, angle, size] of foliage) {
    drawLeaf(layers, x, y, angle + rng.between(-0.12, 0.12),
      size * rng.between(0.9, 1.1), options.curvature / 100);
  }
  drawFlower(layers, 147, 165, 23, options.flower, -Math.PI / 2, rng);
  drawFlower(layers, 114, 213, 17, options.flower, -Math.PI / 3, rng);
  drawFlower(layers, 187, 209, 17, options.flower, Math.PI / 5, rng);
}

function flowingRibbons(layers, rng, curve) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const x = 150 + side * (18 + i * 11);
      const y = 320 + i * 8;
      const wiggle = 9 + curve * 17 + rng.between(-3, 3);
      add(layers, 'detail', new Path().moveTo(x, 170 + i * 6)
        .cubicTo(x + side * wiggle, 220, x - side * (wiggle + 7), 280, x, y)
        .cubicTo(x + side * 13, 335, x + side * 20, 350, x + side * 14, 361));
    }
  }
}

function hatchCurves(layers, density, seed) {
  if (density <= 0) return;
  const lines = Math.round(density * 0.41);
  // Decorative hatching stays separate and does not change primary outlines.
  for (let i = 0; i < lines; i += 1) {
    const t = i / Math.max(lines - 1, 1);
    const side = i % 2 ? 1 : -1;
    const x = 150 + side * (13 + (i % 9) * 2.1);
    const y = 255 + t * 83;
    const lean = side * (5 + (seed % 7));
    add(layers, 'hatching', new Path().moveTo(x, y)
      .cubicTo(x + lean, y + 8, x + lean * 0.65, y + 17, x + lean * 0.3, y + 25));
  }
  for (let i = 0; i < Math.round(lines / 2); i += 1) {
    const x = 111 + i * 4.5;
    const y = 355 + Math.sin(i * 0.75) * 2;
    add(layers, 'hatching', new Path().moveTo(x, y)
      .cubicTo(x + 4, y + 5, x + 8, y + 6, x + 11, y + 7));
  }
}

/** Pure generation function; all physical drawing happens in 300 x 420 design units. */
export function buildBotanicalComposition(options, rng, hatchRng) {
  const layers = { frame: [], outlines: [], detail: [], hatching: [] };
  decorativeFrame(layers);
  sideVines(layers, options, rng);
  centralBouquet(layers, options, rng);
  drawFlower(layers, 150, 87, 29, options.flower, -Math.PI / 2, rng);
  drawFlower(layers, 88, 156, 19, options.flower, -Math.PI / 3, rng);
  drawFlower(layers, 212, 157, 19, options.flower, Math.PI / 5, rng);
  drawFlower(layers, 150, 301, 17, options.flower, Math.PI / 8, rng);
  flowingRibbons(layers, rng, options.curvature / 100);
  hatchCurves(layers, options.hatching, hatchRng.integer(0, 100));
  return layers;
}
