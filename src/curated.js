import { Path, ellipsePath, localPoint } from './geometry.js';
import { SeededRandom } from './prng.js';
import { drawFrame } from './organic.js';
import { buildMusePortrait } from './portrait-muse.js';

function add(layers, layer, path) {
  if (path.length > 0) layers[layer].push({ d: path.d, length: path.length });
}

function petal(layers, cx, cy, radius, angle) {
  const p = (u, v) => localPoint(cx, cy, angle, u, v);
  const a = p(1.4, 0), tip = p(radius, 0);
  const x = p(radius * 0.48, -radius * 0.32);
  const y = p(radius * 0.47, radius * 0.32);
  add(layers, 'frame', new Path().moveTo(a.x, a.y)
    .cubicTo(x.x, x.y, x.x + (tip.x-x.x)*0.5, x.y+(tip.y-x.y)*0.5, tip.x, tip.y)
    .cubicTo(y.x, y.y, a.x, a.y, a.x, a.y));
}

function ornament(layers, side, position, options, rng) {
  const free = (100 - (options.symmetry ?? 100)) / 100;
  const centreX = side < 0 ? 48 : 252;
  const jitter = rng.between(-5, 5);
  const cx = centreX + jitter * free;
  const cy = 186 + position * 81 + rng.between(-11, 11) * free;
  const stemX = side < 0 ? 32 : 268;
  const curving = 0.35 + (options.curvature ?? 75) / 90;
  add(layers, 'frame', new Path().moveTo(stemX, cy + 43)
    .cubicTo(stemX + side * 13 * curving, cy + 13,
      cx - side * 9 * curving, cy + 15, cx, cy));
  const count = options.flower === 'poppy' ? 5 : options.flower === 'iris' ? 3 : 6;
  const baseRadius = options.flower === 'iris' ? 17 : 12;
  const phase = rng.between(-0.22, 0.22);
  for (let i=0;i<count;i++) {
    petal(layers,cx,cy,baseRadius*rng.between(0.83,1.15),phase+i*2*Math.PI/count);
  }
  add(layers,'frame',ellipsePath(cx,cy,1.9,2.2));
  // Botanical ornament stays outside the fixed central facial drawings.
  for(let i=0;i<2;i++){
    const x=stemX+side*(i===0?-5:7), y=cy+21+i*9;
    add(layers,'frame',new Path().moveTo(x,y)
      .cubicTo(x-side*10,y-10,x-side*18,y-7,x-side*17,y-17)
      .cubicTo(x-side*2,y-19,x+side*2,y-5,x,y));
  }
}

/**
 * Place a fixed authored portrait inside deterministic but independent ornament.
 * All geometry is materialised as pen centrelines; there are no SVG transforms,
 * raster assets or dynamic network calls.
 */
export function buildCuratedComposition(options) {
  const layers = buildMusePortrait();
  drawFrame(layers, options.frame ?? 'halo');
  const rng = new SeededRandom(`${options.seed}|muse-01|${options.flower}`);
  const count = Math.round((options.density ?? 65) / 45);
  for (const side of [-1,1]) {
    for(let i=0;i<count;i++) ornament(layers,side,i,options,rng);
  }
  const fraction = Math.max(0, Math.min(100, Number(options.hatching ?? 40))) / 100;
  // Deterministic progressive disclosure of the original pen-safe hatch marks.
  layers.hatching = layers.hatching.slice(0, Math.floor(layers.hatching.length * fraction));
  return layers;
}