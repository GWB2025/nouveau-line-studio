import { Path, ellipsePath, cubicPoint, localPoint } from './geometry.js';
import { SeededRandom } from './prng.js';
import { planBouquet, hatchStrokes } from './composition.js';

const TAU = 2 * Math.PI;
const LAYERS = ['frame', 'outlines', 'detail', 'hatching'];

function add(layers, name, path) {
  if (path.length > 0) layers[name].push({ d: path.d, length: path.length });
}

function stroke(layers, name, start, first, second, end) {
  add(layers, name, new Path().moveTo(start.x, start.y)
    .cubicTo(first.x, first.y, second.x, second.y, end.x, end.y));
}

function decorativeCurl(layers, x, y, mirror, size = 1) {
  add(layers, 'frame', new Path().moveTo(x, y)
    .cubicTo(x + mirror * size * 17, y - size * 12,
      x + mirror * size * 18, y + size * 13, x + mirror * size * 7, y + size * 16)
    .cubicTo(x + mirror * size * 1, y + size * 19,
      x + mirror * size * 1, y + size * 7, x + mirror * size * 9, y + size * 11));
}

function drawFrame(layers, variant) {
  if (variant === 'halo') {
    add(layers, 'frame', ellipsePath(150, 209, 122, 175));
    add(layers, 'frame', ellipsePath(150, 209, 115, 168));
    // A fine crescent and a pair of ogee flourishes above the bouquet.
    add(layers, 'frame', new Path().moveTo(88, 56)
      .cubicTo(118, 34, 181, 34, 212, 56));
    decorativeCurl(layers, 150, 39, -1, 0.8);
    decorativeCurl(layers, 150, 39, 1, 0.8);
  } else if (variant === 'trellis') {
    for (const inset of [0, 8]) {
      add(layers, 'frame', new Path().moveTo(34 + inset, 369)
        .cubicTo(34 + inset, 249, 36 + inset, 125, 91 + inset, 75)
        .cubicTo(118, 58, 132, 43 + inset, 150, 25 + inset)
        .cubicTo(168, 43 + inset, 182, 58, 209 - inset, 75)
        .cubicTo(264 - inset, 125, 266 - inset, 249, 266 - inset, 369));
    }
    for (const side of [-1, 1]) {
      const x = side < 0 ? 36 : 264;
      for (let index = 0; index < 4; index += 1) {
        const y = 154 + 49 * index;
        const inwards = -side;
        add(layers, 'frame', new Path().moveTo(x, y)
          .cubicTo(x + inwards * 13, y - 11, x + inwards * 20, y + 8, x + inwards * 8, y + 19));
      }
      decorativeCurl(layers, 150 + side * 35, 58, side, 0.75);
    }
  } else {
    for (const inset of [0, 7]) {
      add(layers, 'frame', new Path().moveTo(30 + inset, 364)
        .cubicTo(20 + inset, 256, 22 + inset, 145, 70 + inset, 78)
        .cubicTo(97, 38 + inset, 131, 26 + inset, 150, 25 + inset)
        .cubicTo(169, 26 + inset, 203, 38 + inset, 230 - inset, 78)
        .cubicTo(278 - inset, 145, 280 - inset, 256, 270 - inset, 364));
    }
    add(layers, 'frame', new Path().moveTo(30, 364)
      .cubicTo(80, 402, 128, 391, 150, 378)
      .cubicTo(172, 391, 220, 402, 270, 364));
    decorativeCurl(layers, 150, 380, -1, 1.0);
    decorativeCurl(layers, 150, 380, 1, 1.0);
  }
  // Frame ornaments have their own pen layer; never add opaque fills.
  if (variant !== 'halo') {
    for (const side of [-1, 1]) {
      const x = 150 + side * 116;
      add(layers, 'frame', ellipsePath(x, 361, 3.2, 4.2));
    }
  }
}

function leafShape(layers, base, angle, size, widening, shadeAmount, shading) {
  const p = (u, v) => localPoint(base.x, base.y, angle, u, v);
  const width = size * widening;
  const a = p(0, 0);
  const tip = p(size, 0);
  const upper = p(size * 0.45, -width);
  const lower = p(size * 0.43, width);
  add(layers, 'outlines', new Path().moveTo(a.x, a.y)
    .cubicTo(...[p(size * 0.24, -width * 0.72).x, p(size * 0.24, -width * 0.72).y],
      upper.x, upper.y, tip.x, tip.y)
    .cubicTo(lower.x, lower.y, p(size * 0.16, width * 0.75).x,
      p(size * 0.16, width * 0.75).y, a.x, a.y));
  const m = p(size * 0.6, 0);
  stroke(layers, 'detail', a, p(size * 0.25, 0), m, tip);
  for (const offset of hatchStrokes(size * 0.46, shadeAmount * 0.4, 4.5)) {
    const t = 0.27 + offset / (size * 2.2);
    const u = size * t;
    const basePoint = p(u, 0.5);
    const endPoint = p(u + size * 0.04, width * 0.52);
    stroke(layers, 'hatching', basePoint, p(u + 1.2, width * 0.14),
      p(u + 1, width * 0.42), endPoint);
    if (shading === 'crosshatch') {
      stroke(layers, 'hatching', p(u + size * 0.08, width * 0.43),
        p(u + size * 0.055, width * 0.25),
        p(u - 1, width * 0.16), p(u - 1.8, width * 0.08));
    }
  }
}

function flower(layers, centre, variant, rng, options) {
  const { x, y, size } = centre;
  const petalCount = variant === 'poppy' ? 5 : 6;
  const wide = variant === 'poppy' ? 0.66 : variant === 'iris' ? 0.43 : 0.34;
  const phase = rng.between(-0.28, 0.28) - Math.PI / 2;
  for (let index = 0; index < petalCount; index += 1) {
    const angle = phase + index * TAU / petalCount;
    const irregular = variant === 'iris' && index % 2 ? 0.78 : 1;
    const radius = size * irregular * rng.between(0.83, 1.12);
    const width = radius * wide * rng.between(0.86, 1.13);
    const p = (u, v) => localPoint(x, y, angle, u, v);
    const start = p(2.7, 0);
    const tip = p(radius, rng.between(-0.09, 0.09) * width);
    const upperA = p(radius * 0.31, -width * 0.77);
    const upperB = p(radius * 0.80, -width * 1.16);
    const lowerA = p(radius * 0.74, width * 1.12);
    const lowerB = p(radius * 0.24, width * 0.76);
    add(layers, 'outlines', new Path().moveTo(start.x, start.y)
      .cubicTo(upperA.x, upperA.y, upperB.x, upperB.y, tip.x, tip.y)
      .cubicTo(lowerA.x, lowerA.y, lowerB.x, lowerB.y, start.x, start.y));
    stroke(layers, 'detail', p(3.5, 0), p(radius * 0.35, -0.4),
      p(radius * 0.64, -0.5), p(radius * 0.88, 0));
    // Fine strokes sit inside each petal; spacing never falls below 3 units.
    for (const offset of hatchStrokes(radius * 0.46, options.hatching * 0.52, 3.4)) {
      const u = radius * 0.29 + offset;
      const startH = p(u, -width * 0.30);
      const endH = p(u + radius * 0.06, -width * 0.62);
      stroke(layers, 'hatching', startH, p(u, -width * 0.43),
        p(u + radius * 0.045, -width * 0.50), endH);
      if (options.shading === 'crosshatch') {
        stroke(layers, 'hatching', p(u + radius * 0.13, -width * 0.58),
          p(u + radius * 0.1, -width * 0.48), p(u + radius * 0.06, -width * 0.36),
          p(u + radius * 0.02, -width * 0.24));
      }
    }
  }
  add(layers, 'outlines', ellipsePath(x, y, size * 0.12, size * 0.12));
  const stamens = variant === 'poppy' ? 7 : 5;
  for (let i = 0; i < stamens; i += 1) {
    const a = phase + i * TAU / stamens;
    const from = localPoint(x, y, a, size * 0.11);
    const end = localPoint(x, y, a, size * 0.27);
    stroke(layers, 'detail', from,
      localPoint(x, y, a + 0.19, size * 0.17),
      localPoint(x, y, a - 0.08, size * 0.23), end);
    add(layers, 'detail', ellipsePath(end.x, end.y, 0.8, 1.1));
  }
}

function decorateStem(layers, bud, order, allFlowers, rng, options) {
  const anchor = { x: 150 + (bud.x - 150) * 0.17, y: 348 };
  const finish = { x: bud.x, y: bud.y + bud.size * 0.77 };
  const control1 = { x: anchor.x + (bud.x - 150) * 0.3 + rng.between(-7, 7), y: 293 };
  const control2 = { x: bud.x + rng.between(-12, 12), y: bud.y + 46 };
  stroke(layers, 'outlines', anchor, control1, control2, finish);
  const side = bud.x < 149 ? -1 : 1;
  for (const t of [0.34, 0.55]) {
    const origin = cubicPoint(anchor, control1, control2, finish, t);
    const sign = order % 2 ? side : -side;
    const angle = sign < 0 ? -2.46 : -0.70;
    const size = rng.between(16, 24);
    const tip = localPoint(origin.x, origin.y, angle, size);
    if (allFlowers.some(f => Math.hypot(tip.x - f.x, tip.y - f.y) < f.size + 5)) continue;
    leafShape(layers, origin, angle + rng.between(-0.14, 0.14), size,
      rng.between(0.27, 0.36), options.hatching, options.shading);
  }
}

function drawSideFoliage(layers, allFlowers, rng, options) {
  const count = 3 + Math.round(options.density / 33);
  for (const side of [-1, 1]) {
    const x = 150 + side * 99;
    const p0 = { x, y: 347 };
    const p1 = { x: x - side * 24, y: 286 };
    const p2 = { x: x + side * 23, y: 189 };
    const p3 = { x: x - side * 3, y: 99 };
    stroke(layers, 'outlines', p0, p1, p2, p3);
    for (let i = 0; i < count; i += 1) {
      const t = (i + 1) / (count + 1);
      const point = cubicPoint(p0, p1, p2, p3, t);
      const direction = side * (i % 2 ? 1 : -1);
      const angle = direction < 0 ? -2.62 : -0.52;
      const size = rng.between(13, 19);
      const tip = localPoint(point.x, point.y, angle, size);
      if (allFlowers.some(f => Math.hypot(tip.x - f.x, tip.y - f.y) < f.size + 7)) continue;
      leafShape(layers, point, angle, size, 0.3,
        options.hatching * 0.6, options.shading);
    }
  }
}

function ribbonFolds(layers, rng) {
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      const x = 150 + side * (8 + i * 8);
      add(layers, 'detail', new Path().moveTo(x, 312 - i * 8)
        .cubicTo(x + side * rng.between(8, 16), 328,
          x - side * 9, 346, x + side * 9, 363)
        .cubicTo(x + side * 15, 375, x + side * 20, 373, x + side * 24, 370));
    }
  }
}

/** Seeded botanical composition, with no changes to the legacy drawing algorithm. */
export function buildOrganicComposition(options) {
  const layers = Object.fromEntries(LAYERS.map(name => [name, []]));
  const rng = new SeededRandom(`${options.seed}|organic-flora|${options.flower}`);
  const placement = planBouquet(options.seed, options.symmetry);
  const flowers = [placement.top, ...placement.pairs.flatMap(pair => [pair.left, pair.right])];
  drawFrame(layers, options.frame);
  flowers.forEach((bud, index) => decorateStem(layers, bud, index, flowers, rng, options));
  drawSideFoliage(layers, flowers, rng, options);
  flowers.forEach((bud, index) => {
    const chosen = options.flower === 'mixed' ? ['lily', 'iris', 'poppy'][index % 3] : options.flower;
    flower(layers, bud, chosen, rng, options);
  });
  ribbonFolds(layers, rng);
  return layers;
}