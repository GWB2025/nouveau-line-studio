import { SeededRandom } from './prng.js';

/** Deterministic anatomy landmarks in a 300 x 420 design space. */
export function planFigure(seed, pose = 'three-quarter') {
  const rng = new SeededRandom(`${seed}|figure-anatomy-v1`);
  const view = ['front', 'three-quarter', 'profile'].includes(pose)
    ? pose : 'three-quarter';
  const turn = view === 'front' ? 0 : view === 'profile' ? 1 : 0.53;
  const tilt = rng.between(-0.045, 0.045);
  const faceX = 150 + turn * 7 + rng.between(-2.5, 2.5);
  const faceY = 171 + rng.between(-2, 2);
  const map = (x, y) => ({
    x: faceX + x * (1 - 0.20 * turn) + y * (0.115 * turn + tilt),
    y: faceY + y + x * tilt,
  });
  return Object.freeze({
    pose: view, turn, tilt, faceX, faceY,
    crown: map(0, -65),
    chin: map(0, 47),
    leftShoulder: { x: 87 - turn * 4, y: 232 - turn * 3 },
    rightShoulder: { x: 211 + turn * 2, y: 232 + turn * 3 },
  });
}

/** Mapping is performed directly into geometry: SVG transforms are forbidden. */
export function mapFacePoint(plan, x, y) {
  return {
    x: plan.faceX + x * (1 - 0.20 * plan.turn) + y * (0.115 * plan.turn + plan.tilt),
    y: plan.faceY + y + x * plan.tilt,
  };
}