import { validateCseg } from "./cseg.js";

/**
 * Computes the Contour Interval Matrix (CINT) for a CSeg.
 *
 * Convention: the full n x n matrix is returned.
 * CINT[i][j] = c[j] - c[i] for j > i (upper triangle).
 * Lower triangle and diagonal are set to 0.
 *
 * Reference: Morris (1987)
 */
export function cint(c: number[]): number[][] {
  validateCseg(c);
  const n = c.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (j > i) return (c[j] ?? 0) - (c[i] ?? 0);
      return 0;
    }),
  );
}
