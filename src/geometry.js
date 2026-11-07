/** Small, tested geometry primitives shared by preview, metrics and SVG export. */
const KAPPA = 0.5522847498307936;

function num(value) {
  if (!Number.isFinite(value)) throw new RangeError('Non-finite SVG coordinate');
  const rounded = Math.round(value * 1000) / 1000;
  return String(Object.is(rounded, -0) ? 0 : rounded);
}

export function cubicPoint(a, b, c, d, t) {
  const u = 1 - t;
  return {
    x: u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x,
    y: u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y,
  };
}

function distance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export class Path {
  constructor() {
    this.commands = [];
    this.position = null;
    this.start = null;
    this.length = 0;
  }

  moveTo(x, y) {
    this.commands.push(`M ${num(x)} ${num(y)}`);
    this.position = { x, y };
    this.start = { x, y };
    return this;
  }

  lineTo(x, y) {
    if (!this.position) throw new Error('Start path with moveTo');
    const end = { x, y };
    this.commands.push(`L ${num(x)} ${num(y)}`);
    this.length += distance(this.position, end);
    this.position = end;
    return this;
  }

  cubicTo(x1, y1, x2, y2, x3, y3) {
    if (!this.position) throw new Error('Start path with moveTo');
    const a = this.position;
    const b = { x: x1, y: y1 };
    const c = { x: x2, y: y2 };
    const d = { x: x3, y: y3 };
    let previous = a;
    for (let step = 1; step <= 24; step += 1) {
      const point = cubicPoint(a, b, c, d, step / 24);
      this.length += distance(previous, point);
      previous = point;
    }
    this.commands.push(`C ${num(x1)} ${num(y1)} ${num(x2)} ${num(y2)} ${num(x3)} ${num(y3)}`);
    this.position = d;
    return this;
  }

  get d() {
    return this.commands.join(' ');
  }
}

export function ellipsePath(cx, cy, rx, ry) {
  return new Path().moveTo(cx + rx, cy)
    .cubicTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry)
    .cubicTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy)
    .cubicTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry)
    .cubicTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
}

/** Local (u,v) coordinates rotated about the specified point. */
export function localPoint(x, y, angle, u, v = 0) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return { x: x + u * cosine - v * sine, y: y + u * sine + v * cosine };
}
