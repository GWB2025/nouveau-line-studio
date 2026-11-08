import { SeededRandom } from './prng.js';

/** Stable, expressive portrait landmarks in the 300 × 420 illustration space.
 * Coordinates are head-local. Gaze changes only the eyes, not the skull.
 */
export function planPortrait(seed, pose = 'three-quarter', gaze = 'lowered') {
  const view = ['front', 'three-quarter', 'profile'].includes(pose)
    ? pose : 'three-quarter';
  const eyeDirection = ['lowered', 'direct', 'aside'].includes(gaze)
    ? gaze : 'lowered';
  const rng = new SeededRandom(`${seed}|portrait-face-landmarks-v1`);
  const turn = view === 'front' ? 0 : view === 'profile' ? 1 : 0.54;
  const centreX = 148 + turn * 5 + rng.between(-1.4, 1.4);
  const centreY = 171 + rng.between(-1.1, 1.1);
  const tilt = rng.between(-0.038, 0.038);
  return Object.freeze({
    pose: view, gaze: eyeDirection, turn, tilt, centreX, centreY,
    faceHeight: 149,
    landmarks: Object.freeze({ browY: -20, eyesY: -5, noseY: 27,
      lipsY: 45, chinY: 73 }),
  });
}

/** Apply head lean and perspective before generating actual SVG coordinates. */
export function portraitPoint(plan, x, y) {
  const contraction = 1 - plan.turn * 0.08;
  return {
    x: plan.centreX + x * contraction + y * (plan.turn * 0.055 + plan.tilt),
    y: plan.centreY + y + x * plan.tilt,
  };
}

export function eyeLandmarks(plan, side) {
  const isLeft = side === 'left';
  const shift = plan.turn * 5;
  const centreX = (isLeft ? -22 : 23) + shift;
  const width = (isLeft ? 18 - 3 * plan.turn : 18);
  const height = plan.gaze === 'lowered' ? 4.6 : 7.8;
  const irisOffset = plan.gaze === 'aside' ? 3.4 : 0;
  return Object.freeze({ centreX, y: plan.landmarks.eyesY,
    width, height, irisOffset, lidDroop: plan.gaze === 'lowered' ? 2.4 : 0 });
}