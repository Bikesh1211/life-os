/**
 * Deterministic randomness.
 *
 * Every scene is generated rather than hand-placed — thirty books on a shelf,
 * nine ridge lines, forty stars — and generated layouts have to come out
 * identical on the server and in the browser or React tears the tree down and
 * rebuilds it on hydration. `Math.random()` cannot promise that; a seeded PRNG
 * can, and the seed is written into the scene so the same country is drawn
 * every time.
 *
 * mulberry32: thirty-two bits of state, four operations, good enough
 * distribution for scattering dust. Borrowed shape from the portfolio's own
 * backdrop, for the same reason it used one.
 */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The coordinate space every scene is drawn in. */
export const VIEW_W = 1000;
export const VIEW_H = 600;

/** `Array.from` with a seeded generator, which is most of what scenes need. */
export function scatter<T>(seed: number, count: number, make: (rand: () => number, i: number) => T): T[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => make(rand, i));
}
