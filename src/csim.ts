import { comMatrix } from "./com.js";
import { validateCseg } from "./cseg.js";

/**
 * Computes the Contour Similarity measure between two CSeg of equal length.
 *
 * CSIM(a, b) = (matching entries above diagonal) / (n*(n-1)/2)
 *
 * "Above diagonal" means pairs (i, j) with i < j.
 * Range: [0, 1]. Returns 1.0 when a and b are identical.
 *
 * Throws if a and b have different lengths.
 *
 * Reference: Marvin and Laprade (1987)
 */
export function csim(a: number[], b: number[]): number {
  validateCseg(a);
  validateCseg(b);
  if (a.length !== b.length) {
    throw new Error(
      `csim requires two CSeg of equal length; got lengths ${a.length} and ${b.length}.`,
    );
  }
  const n = a.length;
  const comA = comMatrix(a);
  const comB = comMatrix(b);
  const total = (n * (n - 1)) / 2;
  if (total === 0) return 1;
  let matches = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if ((comA[i]?.[j] ?? 0) === (comB[i]?.[j] ?? 0)) {
        matches++;
      }
    }
  }
  return matches / total;
}
