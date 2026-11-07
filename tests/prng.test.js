import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../src/prng.js';

test('same seed yields the same random sequence', () => {
  const a = new SeededRandom('art-20261107');
  const b = new SeededRandom('art-20261107');
  assert.deepEqual(Array.from({ length: 20 }, () => a.next()),
    Array.from({ length: 20 }, () => b.next()));
});

test('different seeds yield different sequences', () => {
  const a = new SeededRandom('first');
  const b = new SeededRandom('second');
  assert.notDeepEqual(Array.from({ length: 10 }, () => a.next()),
    Array.from({ length: 10 }, () => b.next()));
});

test('range stays within supplied interval', () => {
  const rng = new SeededRandom('range');
  for (let i = 0; i < 1000; i += 1) {
    const value = rng.between(-7, 13);
    assert.ok(value >= -7 && value < 13);
  }
});
