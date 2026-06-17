import { validateCseg } from "./cseg.js";

/**
 * Result of a Morris contour reduction.
 *
 * prime  - the reduced contour segment (a valid CSeg, 0..k-1 by relative height).
 * depth  - the number of reduction passes that removed at least one interior point.
 *          A contour that is already fully reduced has depth 0.
 */
export interface ContourReductionResult {
  readonly prime: readonly number[];
  readonly depth: number;
}

/**
 * Renumbers an array of values to the range 0..k-1 by relative height.
 * This converts a retained subsequence of a CSeg back into a valid CSeg.
 *
 * Example: [0, 5, 3, 4, 1, 6] -> [0, 4, 2, 3, 1, 5]
 */
function renumber(values: readonly number[]): readonly number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const rankMap = new Map<number, number>();
  sorted.forEach((v, rank) => {
    rankMap.set(v, rank);
  });
  return values.map((v) => {
    const rank = rankMap.get(v);
    if (rank === undefined) {
      throw new Error(`Internal error: value ${v} not in rank map.`);
    }
    return rank;
  });
}

/**
 * Applies one reduction pass over the currently-kept indices.
 *
 * Algorithm (Morris 1993):
 *   Step 1. The first and last indices are always retained (endpoints).
 *   Step 2. For each interior kept index, check whether it is a local maximum
 *           among the nearest kept neighbors on each side. An interior point
 *           is a local maximum if its value is >= both neighbors (i.e. it is
 *           not strictly lower than either neighbor). It is a local minimum if
 *           its value is <= both neighbors (not strictly higher than either).
 *           An interior point that is neither a local max nor a local min is
 *           removed from the kept set.
 *   Step 3. When a string of consecutive kept points share the same maximum
 *           (or minimum) height, only the first in each maximal run is
 *           retained (ties broken by keeping the leftmost). Because CSeg
 *           integers are distinct by definition, tied values between adjacent
 *           kept points cannot arise; this convention is documented for
 *           completeness.
 *
 * Returns the new set of kept indices and a flag indicating whether any
 * interior point was removed.
 *
 * Endpoint handling: the first and last kept indices are never candidates for
 * removal regardless of their neighbor relationship.
 *
 * Tie handling at interior points: because a valid CSeg has distinct integers,
 * c[i] === c[j] for two different positions is impossible. The >= / <= tests
 * therefore reduce to strict > / < in practice, but the >= form is used to
 * match Morris's formulation (which uses "not-lower-than" for maxima).
 */
function reductionPass(
  values: readonly number[],
  keptIndices: number[],
): { nextKept: number[]; removed: boolean } {
  if (keptIndices.length <= 2) {
    // Only endpoints remain; nothing can be removed.
    return { nextKept: keptIndices, removed: false };
  }

  // Build a set for O(1) lookup of the next/prev kept index by position.
  // We iterate through keptIndices directly, so indices into keptIndices
  // represent positions in the kept sequence.
  const nextKept: number[] = [keptIndices[0] as number]; // always keep first
  let removed = false;

  for (let ki = 1; ki < keptIndices.length - 1; ki++) {
    const idx = keptIndices[ki] as number;
    const leftIdx = keptIndices[ki - 1] as number;
    const rightIdx = keptIndices[ki + 1] as number;

    const val = values[idx] as number;
    const leftVal = values[leftIdx] as number;
    const rightVal = values[rightIdx] as number;

    // An interior point is retained if it is a local max (>= both neighbors)
    // OR a local min (<= both neighbors).
    // Because CSeg values are distinct, this is effectively > both or < both.
    const isMax = val >= leftVal && val >= rightVal;
    const isMin = val <= leftVal && val <= rightVal;

    if (isMax || isMin) {
      nextKept.push(idx);
    } else {
      removed = true;
    }
  }

  nextKept.push(keptIndices[keptIndices.length - 1] as number); // always keep last
  return { nextKept, removed };
}

/**
 * Applies Morris's contour-reduction algorithm to a CSeg and returns its
 * prime form together with the reduction depth.
 *
 * Reference:
 *   Morris, R. D. (1993). New directions in the theory and analysis of
 *   musical contour. Music Theory Spectrum, 15(2), 205-228.
 *
 * Algorithm summary:
 *   1. The first and last elements of the CSeg are always retained.
 *   2. Successive passes identify interior local maxima and minima (among
 *      the currently retained points). Non-maximal, non-minimal interior
 *      points are discarded. Each pass that removes at least one point
 *      increments the depth counter.
 *   3. Passes continue until no point is removed in a full pass.
 *   4. The remaining values are renumbered 0..k-1 by relative height to
 *      yield the prime.
 *
 * Depth convention: depth counts the number of passes that reduced the
 * contour (i.e. removed at least one point). A contour that is already
 * irreducible returns depth 0. The prime of <0 2 1> is itself with depth 0.
 *
 * Endpoint handling: the first and last elements are kept in every pass.
 *
 * Tie handling: CSeg integers are distinct by definition, so ties between
 * two distinct positions cannot arise. The local-max/min test uses >=/<= to
 * match Morris's "not-lower-than" phrasing; in practice this always reduces
 * to strict >/<.
 *
 * @param csegInput - a valid contour segment (array of distinct integers 0..n-1)
 * @returns ContourReductionResult with prime (a valid CSeg) and depth (>= 0)
 */
export function contourReduction(csegInput: readonly number[]): ContourReductionResult {
  validateCseg([...csegInput]);

  const values: readonly number[] = csegInput;
  let keptIndices: number[] = csegInput.map((_, i) => i);
  let depth = 0;

  // Short-circuit: 2-element csegs are already fully reduced.
  if (csegInput.length <= 2) {
    return { prime: [...csegInput], depth: 0 };
  }

  // Iteratively apply reduction passes until stable.
  while (true) {
    const { nextKept, removed } = reductionPass(values, keptIndices);
    if (removed) {
      depth += 1;
      keptIndices = nextKept;
    } else {
      break;
    }

    // A 2-element result is maximally reduced; no further passes needed.
    if (keptIndices.length <= 2) {
      break;
    }
  }

  // Extract the retained values and renumber them to form a valid CSeg.
  const retainedValues = keptIndices.map((i) => values[i] as number);
  const prime = renumber(retainedValues);

  return { prime, depth };
}
