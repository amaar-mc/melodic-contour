import { validateCseg } from "./cseg.js";

/**
 * Computes the Contour Adjacency Series (CAS) for a CSeg.
 *
 * CAS[i] = sign(c[i+1] - c[i]) for i in 0..n-2
 * Length is n-1. For distinct CSeg integers, values are in {-1, +1}.
 *
 * Reference: Friedmann (1985)
 */
export function cas(c: number[]): number[] {
  validateCseg(c);
  const result: number[] = [];
  for (let i = 0; i < c.length - 1; i++) {
    const diff = (c[i + 1] ?? 0) - (c[i] ?? 0);
    if (diff > 0) result.push(1);
    else if (diff < 0) result.push(-1);
    else result.push(0);
  }
  return result;
}

/**
 * Computes the CAS Vector: [ascents, descents].
 *
 * Returns [count of +1 in CAS, count of -1 in CAS].
 */
export function casVector(c: number[]): [number, number] {
  const series = cas(c);
  let ascents = 0;
  let descents = 0;
  for (const s of series) {
    if (s === 1) ascents++;
    else if (s === -1) descents++;
  }
  return [ascents, descents];
}
