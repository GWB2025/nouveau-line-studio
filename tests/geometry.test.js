import test from 'node:test';
import assert from 'node:assert/strict';
import { Path, cubicPoint, ellipsePath } from '../src/geometry.js';

test('cubic Bézier interpolation honours both endpoints', () => {
  const p0 = { x: 0, y: 5 }, p1 = { x: 3, y: 9 };
  const p2 = { x: 5, y: 12 }, p3 = { x: 20, y: 21 };
  assert.deepEqual(cubicPoint(p0, p1, p2, p3, 0), p0);
  assert.deepEqual(cubicPoint(p0, p1, p2, p3, 1), p3);
});

test('straight segment length is measured', () => {
  const path = new Path().moveTo(0, 0).lineTo(3, 4);
  assert.ok(Math.abs(path.length - 5) < 1e-9);
  assert.match(path.d, /^M 0 0 L 3 4$/);
});

test('ellipse comprises real cubic paths rather than a raster or fill', () => {
  const ellipse = ellipsePath(150, 200, 20, 50);
  assert.equal((ellipse.d.match(/ C /g) ?? []).length, 4);
  assert.ok(ellipse.length > 200);
  assert.ok(ellipse.length < 240);
});
