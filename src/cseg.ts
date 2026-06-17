// Contour segment utilities.
// A CSeg (contour segment) is a list of distinct contour integers 0..n-1
// where n is the length of the segment.

/**
 * Validates that an array is a valid CSeg:
 * distinct non-negative integers forming exactly the set {0, 1, ..., n-1}.
 * Throws a descriptive error if invalid.
 */
export function validateCseg(c: number[]): void {
  if (c.length === 0) {
    throw new Error("CSeg must not be empty.");
  }
  const sorted = [...c].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) {
      throw new Error(
        `Invalid CSeg: expected distinct integers 0..${c.length - 1}, got [${c.join(", ")}].`,
      );
    }
  }
}

/**
 * Maps a list of pitches to contour integers by rank.
 * The lowest pitch maps to 0, the next distinct value to 1, and so on.
 * Original ordering is preserved.
 *
 * Throws if pitches contains repeated values (equal pitches would break
 * the distinct-integer requirement for a CSeg).
 *
 * Example: cseg([60, 67, 62, 64]) => [0, 3, 1, 2]
 */
export function cseg(pitches: number[]): number[] {
  if (pitches.length === 0) {
    throw new Error("Pitch list must not be empty.");
  }
  const sorted = [...pitches].sort((a, b) => a - b);
  // Check for duplicates
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1]) {
      throw new Error(
        `Repeated pitch ${sorted[i]} in input: equal pitches cannot form a valid CSeg with distinct contour integers.`,
      );
    }
  }
  const rankMap = new Map<number, number>();
  sorted.forEach((pitch, rank) => {
    rankMap.set(pitch, rank);
  });
  return pitches.map((p) => {
    const rank = rankMap.get(p);
    if (rank === undefined) {
      throw new Error(`Internal error: pitch ${p} not in rank map.`);
    }
    return rank;
  });
}
