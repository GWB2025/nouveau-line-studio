import { SeededRandom } from './prng.js';

/**
 * A floral grammar with protected blossom centres.
 * The seed affects each composition independently of the hatching controls.
 * 100% symmetry mirrors the left hand arrangement exactly; lower settings
 * gradually allow the right hand flowers to grow independently.
 */
export function planBouquet(seed, symmetry = 100) {
  const rng = new SeededRandom(`${seed}|organic-placement`);
  const free = 1 - Math.max(0, Math.min(100, symmetry)) / 100;
  const base = [
    { x: 94, y: 171, size: 18 },
    { x: 104, y: 246, size: 18 },
    { x: 92, y: 304, size: 15 },
  ];
  const jitter = (amount) => rng.between(-amount, amount);
  const top = {
    x: 150 + jitter(10) * free,
    y: 119 + jitter(6) * free,
    size: 24,
  };
  const pairs = base.map((position, i) => {
    const left = {
      x: position.x + jitter(5),
      y: position.y + jitter(4),
      size: position.size + rng.between(-1.4, 1.4),
    };
    const right = {
      x: 300 - left.x + jitter(14) * free,
      y: left.y + jitter(15) * free,
      size: left.size + jitter(3.8) * free,
    };
    return { left, right, tier: i };
  });
  return { top, pairs };
}

/** Returns pen-safe distances from one another, never more than the span. */
export function hatchStrokes(span, amount, minimumSpacing = 3) {
  const length = Number(span);
  const gap = Math.max(0.1, Number(minimumSpacing));
  if (!(length > 0) || !(amount > 0)) return [];
  const maximum = Math.floor(length / gap) + 1;
  const count = Math.min(maximum, Math.max(1, Math.round(maximum * Math.min(100, amount) / 100)));
  const left = (length - (count - 1) * gap) / 2;
  return Array.from({ length: count }, (_, index) => left + index * gap);
}