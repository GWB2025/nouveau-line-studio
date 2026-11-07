/** Deterministic, dependency-free PRNG. Not intended for cryptography. */
export class SeededRandom {
  constructor(seed) {
    let hash = 2166136261;
    for (const character of String(seed)) {
      hash ^= character.codePointAt(0);
      hash = Math.imul(hash, 16777619);
    }
    this.state = hash >>> 0;
  }

  next() {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  between(minimum, maximum) {
    return minimum + (maximum - minimum) * this.next();
  }

  integer(minimum, maximumInclusive) {
    return Math.floor(this.between(minimum, maximumInclusive + 1));
  }
}
