import { Path, ellipsePath } from './geometry.js';
import { SeededRandom } from './prng.js';
import { drawFrame } from './organic.js';
import { planPortrait, portraitPoint, eyeLandmarks } from './portrait-landmarks.js';

/** Original whiplash-line portrait: zero fills, no SVG transforms or raster art. */
const segment = (a, b, end) => [a, b, end];
const allLayers = () => ({ frame: [], outlines: [], detail: [], hatching: [] });
const absolute = ([x, y]) => ({ x, y });

function line(layers, layer, start, sections, project = absolute) {
  const first = project(start);
  const path = new Path().moveTo(first.x, first.y);
  for (const [p, q, r] of sections) {
    const a = project(p); const b = project(q); const c = project(r);
    path.cubicTo(a.x, a.y, b.x, b.y, c.x, c.y);
  }
  if (path.length > 0) layers[layer].push({ d: path.d, length: path.length });
}
function stroke(layers, layer, a, b, c, d, project = absolute) {
  line(layers, layer, a, [segment(b, c, d)], project);
}
function mapped(plan) { return ([x, y]) => portraitPoint(plan, x, y); }

function faceSilhouette(layers, plan) {
  const p = mapped(plan);
  const t = plan.turn;
  if (plan.pose === 'profile') {
    // Profile carries an uninterrupted forehead → nose → lip → chin contour.
    line(layers, 'outlines', [-27, -64], [
      segment([-8, -76], [17, -61], [23, -46]),
      segment([29, -31], [28, -18], [36, -7]),
      segment([40, 1], [52, 8], [48, 14]),
      segment([44, 18], [36, 19], [34, 23]),
      segment([35, 30], [44, 33], [41, 38]),
      segment([37, 40], [39, 43], [38, 47]),
      segment([38, 53], [31, 54], [25, 58]),
      segment([13, 71], [3, 78], [-11, 71]),
      segment([-30, 58], [-46, 25], [-45, -9]),
    ], p);
    // The visible ear belongs behind the hairline, away from the lip/nose.
    line(layers, 'outlines', [-40, -7], [
      segment([-59, -21], [-59, 11], [-43, 25]),
      segment([-37, 18], [-41, 11], [-39, 5]),
    ], p);
    stroke(layers, 'detail', [-47, -3], [-56, 1], [-47, 16], [-43, 15], p);
  } else {
    const far = -48 + 12 * t;
    const near = 48 + 1 * t;
    line(layers, 'outlines', [far + 8, -65], [
      segment([far - 12, -44], [far - 4, -4], [far, 20]),
      segment([far + 2, 44], [-21, 68], [-2 + 5 * t, 74]),
      segment([18, 76], [near - 5, 51], [near, 23]),
      segment([near + 5, -4], [near + 3, -50], [18, -66]),
      segment([5, -76], [-26, -77], [far + 8, -65]),
    ], p);
    // Delicate cheek/ear only where the near hairline exposes it.
    line(layers, 'outlines', [near - 1, 4], [
      segment([near + 10, -2], [near + 13, 19], [near - 1, 27]),
    ], p);
    stroke(layers, 'detail', [near + 2, 12], [near + 9, 7], [near + 7, 19], [near + 1, 21], p);
    stroke(layers, 'detail', [far + 3, 9], [far + 10, 21], [far + 13, 25], [far + 13, 32], p);
  }
}

function eyelid(layers, plan, eye, side) {
  const p = mapped(plan);
  const { centreX: x, y, width, height, irisOffset } = eye;
  const left = x - width / 2;
  const right = x + width / 2;
  const outer = side === 'left' ? left : right;
  const inner = side === 'left' ? right : left;
  const upperY = y - height * 0.57;
  // Long upper lash line, low lower eyelid and a partially hidden iris.
  stroke(layers, 'detail', [left, y],
    [left + width * 0.24, upperY - 1.5],
    [left + width * 0.69, upperY - 2.2], [right, y + 0.3], p);
  stroke(layers, 'detail', [left + width * 0.07, y + 1],
    [left + width * 0.36, y + height * 0.62],
    [left + width * 0.71, y + height * 0.56],
    [right - width * 0.07, y + 0.7], p);
  const iris = x + irisOffset;
  stroke(layers, 'detail', [iris - 3.6, upperY + 0.1],
    [iris - 4.9, y + height * 0.6],
    [iris + 2.9, y + height * 0.6], [iris + 3.6, upperY + 0.1], p);
  stroke(layers, 'detail', [iris - 0.45, upperY + 1.0],
    [iris + 0.2, upperY + 3.8], [iris + 0.8, upperY + 4.2],
    [iris + 1.0, upperY + 1.6], p);
  // Eyebrows arch gently over eyelids, as in Art Nouveau fashion drawings.
  stroke(layers, 'detail', [left - 1.5, y - 12.7],
    [left + width * 0.26, y - 19.3],
    [left + width * 0.7, y - 18.0], [right + 0.9, y - 14.4], p);
  // Two fine tapering outer lashes, not decorative spokes around the eye.
  for (let i = 0; i < 2; i++) {
    const dir = side === 'left' ? -1 : 1;
    stroke(layers, 'detail', [outer, y],
      [outer + dir * (2 + i), y - 1.0],
      [outer + dir * (3 + i), y - 3.0],
      [outer + dir * (4.3 + i), y - (4 + i)], p);
  }
  // Sparse tear-duct marking, no heavy eye oval.
  stroke(layers, 'detail', [inner, y + 0.3],
    [inner - 1, y + 1.0], [inner - 0.1, y + 2.0], [inner + 0.8, y + 2.2], p);
}

function facialFeatures(layers, plan) {
  const p = mapped(plan);
  const t = plan.turn;
  if (plan.pose === 'profile') {
    // One elongated eye viewed obliquely, with a soft high eyebrow.
    stroke(layers, 'detail', [8, -9], [19, -13], [24, -12], [29, -8], p);
    stroke(layers, 'detail', [8, -9], [15, -3], [23, -3], [29, -8], p);
    stroke(layers, 'detail', [14, -9], [13, -3], [18, -2], [20, -9], p);
    stroke(layers, 'detail', [7, -20], [15, -25], [25, -23], [30, -19], p);
    // Profile nose: minimal bridge and a discrete lower nostril.
    stroke(layers, 'detail', [24, -18], [29, -3], [33, 5], [40, 11], p);
    stroke(layers, 'detail', [41, 18], [35, 17], [33, 20], [33, 22], p);
    // Upper/lower lip separated, with cupid's bow implied by broken contours.
    stroke(layers, 'detail', [34, 37], [39, 35], [42, 37], [40, 40], p);
    stroke(layers, 'detail', [39, 47], [36, 50], [32, 49], [30, 47], p);
    stroke(layers, 'detail', [-1, 56], [6, 59], [12, 60], [17, 59], p);
    return;
  }
  eyelid(layers, plan, eyeLandmarks(plan, 'left'), 'left');
  eyelid(layers, plan, eyeLandmarks(plan, 'right'), 'right');
  // Tapered nose: bridge only on the shadow side, softly indicated alae.
  const nx = t * 8;
  stroke(layers, 'detail', [nx - 1, -4],
    [nx + 0.2, 8], [nx + 6, 15], [nx + 9, 24], p);
  stroke(layers, 'detail', [nx + 9, 24],
    [nx + 10.2, 28], [nx + 5.2, 29], [nx + 2, 28], p);
  stroke(layers, 'detail', [nx - 5, 25],
    [nx - 3, 29], [nx - 1, 30], [nx + 1.5, 29], p);
  stroke(layers, 'detail', [nx + 13, 27],
    [nx + 13, 29], [nx + 11, 31], [nx + 9, 31], p);
  // Philtrum and two deliberately separate lips: Cupid's bow on top,
  // lower reflected curve and a short central shadow instead of a circle.
  const mx = nx + 1.5;
  stroke(layers, 'detail', [mx - 1.8, 34],
    [mx - 2, 36], [mx - 1, 37], [mx, 38], p);
  line(layers, 'detail', [mx - 16, 44], [
    segment([mx - 11, 39], [mx - 6, 41], [mx - 1.5, 42]),
    segment([mx + 1.5, 39.5], [mx + 4, 40.5], [mx + 6, 42]),
    segment([mx + 11, 40], [mx + 15, 42.5], [mx + 17, 44.2]),
  ], p);
  stroke(layers, 'detail', [mx - 16, 44],
    [mx - 7, 49], [mx + 8, 49], [mx + 17, 44.2], p);
  stroke(layers, 'detail', [mx - 12, 49],
    [mx - 5, 54], [mx + 7, 54], [mx + 12, 49], p);
  stroke(layers, 'detail', [mx - 7, 59],
    [mx - 1, 60], [mx + 5, 60], [mx + 8, 58], p);
  // Cheekbone and temple contours give the face a softly modelled turn.
  stroke(layers, 'detail', [34 - t * 1, 2],
    [40, 14], [39, 27], [30, 35], p);
  stroke(layers, 'detail', [-39 + t * 8, 10],
    [-38 + t * 9, 23], [-32 + t * 8, 28], [-29 + t * 7, 31], p);
}

function throatAndCostume(layers, plan, options) {
  const p = mapped(plan);
  // Long, elegant neck and exposed upper chest above the gown or shawl.
  stroke(layers, 'outlines', [-31, 56], [-36, 87], [-34, 111], [-53, 122], p);
  stroke(layers, 'outlines', [34, 53], [33, 83], [30, 106], [51, 121], p);
  stroke(layers, 'detail', [-17, 79], [-17, 93], [8, 102], [17, 100], p);
  // Bust silhouette beneath ornate hair, sized for A6 portrait framing.
  line(layers, 'outlines', [p([-53, 122]).x, p([-53, 122]).y], [
    segment([95, 297], [77, 305], [69, 332]),
    segment([61, 354], [64, 368], [74, 372]),
  ]);
  line(layers, 'outlines', [p([51, 121]).x, p([51, 121]).y], [
    segment([211, 295], [235, 313], [239, 339]),
    segment([242, 357], [243, 367], [233, 374]),
  ]);
  stroke(layers, 'outlines', [74, 372], [120, 384], [190, 383], [233, 374]);
  stroke(layers, 'detail', [75, 315], [102, 327], [122, 336], [132, 352]);
  stroke(layers, 'detail', [221, 313], [203, 325], [188, 341], [178, 359]);
  if (options.dress === 'shawl') {
    line(layers, 'outlines', [89, 308], [
      segment([111, 330], [148, 324], [211, 305]),
      segment([194, 342], [156, 357], [113, 339]),
    ]);
    stroke(layers, 'detail', [113, 339], [140, 349], [174, 338], [196, 327]);
  } else {
    // Scalloped Art Nouveau neckline, with a fine pendant below.
    stroke(layers, 'outlines', [102, 299], [131, 314], [140, 328], [150, 339]);
    stroke(layers, 'outlines', [202, 299], [176, 315], [164, 328], [150, 339]);
    const pendant = ellipsePath(150, 337, 5.2, 7.5);
    layers.detail.push({ d: pendant.d, length: pendant.length });
    stroke(layers, 'detail', [150, 344], [146, 349], [151, 354], [150, 359]);
  }
  const flow = 0.55 + options.curvature / 110;
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const x = 100 + t * 105;
    stroke(layers, 'detail', [x, 344],
      [x - flow * 10, 355], [x + flow * 7, 365], [x - flow * 2, 373]);
  }
}

function hairCrown(layers, plan, options) {
  const p = mapped(plan);
  const flow = 0.6 + options.curvature / 160;
  // Asymmetric S-shaped crown: four changing lobes instead of one helmet arc.
  line(layers, 'outlines', [-47, -40], [
    segment([-73, -72], [-49, -106], [-23, -97]),
    segment([-1, -114], [11, -114], [29, -100]),
    segment([57, -104], [69, -71], [64, -57]),
    segment([81, -21], [72, 18], [60, 50]),
  ], p);
  // A windswept fringe ends above the brows, allowing the face to read clearly.
  line(layers, 'outlines', [-47, -38], [
    segment([-29, -72 - 4 * flow], [-2, -86], [24, -69]),
    segment([42, -60], [44, -43], [45, -36]),
  ], p);
  line(layers, 'detail', [-49, -42], [
    segment([-30, -90], [1, -98], [36, -66]),
  ], p);
  line(layers, 'detail', [-30, -85], [
    segment([-4, -103], [18, -100], [42, -82]),
  ], p);
  stroke(layers, 'detail', [-41, -37],
    [-51, -15], [-43, 7], [-49, 24], p);
  stroke(layers, 'detail', [50, -44],
    [59, -19], [49, 9], [55, 27], p);
}

function hairLocks(layers, plan, options, rng) {
  const p = mapped(plan);
  const flow = 0.65 + options.curvature / 110;
  const updo = options.hairstyle === 'updo';
  const braid = options.hairstyle === 'braid';
  const number = updo ? 4 : 7;
  for (const side of [-1, 1]) {
    for (let i = 0; i < number; i++) {
      const spread = i / Math.max(1, number - 1);
      const x = side * (49 + spread * 17);
      const startY = -51 + i * 6;
      const yMid = 71 + i * 7;
      const endY = (updo ? 135 : 157) + i * (updo ? 9 : 17)
        + rng.between(-2.5, 2.5);
      const wave = side * (17 + 8 * flow);
      const xEnd = side * (60 + i * (updo ? 1.6 : 3.5));
      // Two linked whiplash curves produce an S-wave and curled lock.
      line(layers, i < 2 ? 'outlines' : 'detail', [x, startY], [
        segment([x + wave, -6 + i * 2],
          [x - side * (13 + 2 * i) * flow, yMid - 39],
          [x + side * (5 + 1.5 * i), yMid]),
        segment([x + side * (31 + 3 * i) * flow, yMid + 31],
          [xEnd - side * (18 + 1.7 * i), endY - 25], [xEnd, endY]),
        segment([xEnd + side * 18, endY + 9],
          [xEnd + side * 17, endY - 15], [xEnd + side * 4, endY - 8]),
      ], p);
    }
  }
  if (updo) {
    // A pair of spiral sections define the pinned hair more naturally.
    for (let i = 0; i < 5; i++) {
      const a = -38 + i * 16;
      stroke(layers, i % 2 ? 'detail' : 'outlines', [a, -80],
        [a - 13, -121], [a + 28, -133], [a + 26, -85], p);
    }
  }
  if (braid) {
    // Opposed curved sections, no filled black areas or tiny polygons.
    for (let i = 0; i < 11; i++) {
      const y = 58 + 11 * i;
      const x = -68 - i * 0.7;
      stroke(layers, 'outlines', [x - 8, y], [x - 4, y + 9],
        [x + 13, y + 9], [x + 8, y + 15], p);
      stroke(layers, 'detail', [x + 8, y + 2], [x + 2, y + 8],
        [x - 11, y + 12], [x - 7, y + 16], p);
    }
  }
}

/** Lily-like blossoms nestle into the curls without covering eyes or lips. */
function headpiece(layers, plan, options, rng) {
  if (options.density < 20) return;
  const p = mapped(plan);
  const petals = options.flower === 'poppy' ? 5 : 6;
  for (const side of [-1, 1]) {
    const cx = side * 59;
    const cy = -70 + (side > 0 ? -7 : 4);
    for (let i = 0; i < petals; i++) {
      const angle = 2 * Math.PI * i / petals - Math.PI / 2 + 0.18;
      const radius = (side > 0 ? 15 : 17) * rng.between(0.92, 1.09);
      const ux = Math.cos(angle), uy = Math.sin(angle);
      const vx = -uy, vy = ux;
      const tip = [cx + radius * ux, cy + radius * uy];
      const a = [cx + 1.8 * ux, cy + 1.8 * uy];
      const left = [cx + 0.52 * radius * ux + 0.3 * radius * vx,
        cy + 0.52 * radius * uy + 0.3 * radius * vy];
      const right = [cx + 0.52 * radius * ux - 0.3 * radius * vx,
        cy + 0.52 * radius * uy - 0.3 * radius * vy];
      line(layers, 'detail', a, [
        segment([cx + 0.14 * radius * ux + 0.24 * radius * vx,
          cy + 0.14 * radius * uy + 0.24 * radius * vy], left, tip),
        segment(right, [cx + 0.14 * radius * ux - 0.24 * radius * vx,
          cy + 0.14 * radius * uy - 0.24 * radius * vy], a),
      ], p);
      stroke(layers, 'detail', a, [cx + 0.29 * radius * ux,
        cy + 0.29 * radius * uy], [cx + 0.7 * radius * ux,
        cy + 0.7 * radius * uy], tip, p);
    }
    // A restrained flower centre is a small open oval, not a solid dot.
    const c = p([cx, cy]);
    const core = ellipsePath(c.x, c.y, 2.1, 2.1);
    layers.detail.push({ d: core.d, length: core.length });
  }
}

function decoration(layers, options, rng) {
  // Sparse stems and elongated botanical leaves sit outside the facial area.
  const count = Math.max(0, Math.round((options.density ?? 65) / 31));
  if (count === 0) return;
  for (const side of [-1, 1]) {
    const x = 150 + side * 108;
    stroke(layers, 'detail', [x, 324],
      [x - side * 12, 252], [x + side * 10, 175], [x - side * 1, 106]);
    for (let i = 0; i < count; i++) {
      const y = 140 + i * 73;
      const offset = rng.between(-2, 2);
      const bx = x - side * 2 + offset;
      const tip = [bx - side * (18 + i * 3), y - (17 - i * 2)];
      const base = [bx, y];
      line(layers, 'outlines', base, [
        segment([bx - side * 11, y - 2],
          [tip[0] - side * 9, tip[1] + 4], tip),
        segment([tip[0] + side * 6, tip[1] + 8],
          [bx - side * 5, y + 8], base),
      ]);
      stroke(layers, 'detail', base,
        [bx - side * 8, y - 4],
        [tip[0] + side * 5, tip[1] + 3], tip);
    }
  }
}

function shade(layers, plan, options) {
  const amount = options.hatching / 100;
  if (amount <= 0) return;
  const p = mapped(plan);
  const steps = Math.max(1, Math.round(amount * 16));
  for (let i = 0; i < steps; i++) {
    const v = steps === 1 ? 0.5 : i / (steps - 1);
    // Shading hugs the cheek and throat instead of turning into solid fills.
    const y = 18 + 31 * v;
    const x = -33 + 13 * v + plan.turn * 4;
    stroke(layers, 'hatching', [x, y],
      [x + 5, y + 2], [x + 8, y + 4], [x + 11, y + 3], p);
    const neckY = 72 + 38 * v;
    stroke(layers, 'hatching', [23, neckY],
      [27, neckY + 2], [31, neckY + 5], [33, neckY + 7], p);
    if (options.shading === 'crosshatch') {
      stroke(layers, 'hatching', [x + 9, y - 1],
        [x + 6, y + 3], [x + 4, y + 7], [x + 2, y + 8], p);
    }
  }
}

function portraitFrame(layers, style) {
  if (style !== 'halo') {
    drawFrame(layers, style ?? 'arch');
    return;
  }
  // A broken double nimbus frames the head rather than crossing the gown.
  line(layers, 'frame', [42, 257], [
    segment([23, 155], [52, 43], [150, 42]),
    segment([248, 43], [277, 155], [258, 257]),
  ]);
  line(layers, 'frame', [48, 249], [
    segment([34, 157], [64, 51], [150, 51]),
    segment([236, 51], [266, 157], [252, 249]),
  ]);
  // Engraved turn-of-the-century base and two restrained corner motifs.
  stroke(layers, 'frame', [68, 381], [107, 395], [193, 395], [232, 381]);
  for (const side of [-1, 1]) {
    const x = 150 + side * 109;
    stroke(layers, 'frame', [x, 258],
      [x + side * 9, 286], [x - side * 6, 313], [x, 337]);
  }
}

export function buildPortraitComposition(options) {
  const layers = allLayers();
  const plan = planPortrait(options.seed ?? '20261108',
    options.figurePose, options.gaze);
  const rng = new SeededRandom(`${options.seed}|portrait-art-v1`);
  portraitFrame(layers, options.frame ?? 'halo');
  decoration(layers, options, rng);
  throatAndCostume(layers, plan, options);
  hairCrown(layers, plan, options);
  hairLocks(layers, plan, options, rng);
  headpiece(layers, plan, options, rng);
  faceSilhouette(layers, plan);
  facialFeatures(layers, plan);
  shade(layers, plan, options);
  return layers;
}