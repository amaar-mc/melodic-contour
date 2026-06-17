import { validateCseg } from "./cseg.js";

/**
 * Computes the Comparison Matrix (COM matrix) for a CSeg.
 *
 * COM[i][j] = sign(c[j] - c[i]) in {-1, 0, +1}
 * - Diagonal: COM[i][i] = 0
 * - Antisymmetric: COM[j][i] = -COM[i][j]
 *
 * For a CSeg of distinct integers, off-diagonal entries are -1 or +1.
 *
 * Reference: Morris (1987), Friedmann (1985)
 */
export function comMatrix(c: number[]): number[][] {
  validateCseg(c);
  const n = c.length;
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const diff = (c[j] ?? 0) - (c[i] ?? 0);
      if (diff > 0) return 1;
      if (diff < 0) return -1;
      return 0;
    }),
  );
}
