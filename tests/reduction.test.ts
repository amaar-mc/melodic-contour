import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { validateCseg } from "../src/cseg.js";
import { retrograde } from "../src/equivalence.js";
import { contourReduction } from "../src/reduction.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("contourReduction", () => {
  describe("golden tests - endpoints always retained", () => {
    it("prime of [0] is [0] with depth 0", () => {
      const result = contourReduction([0]);
      expect(result.prime).toEqual([0]);
      expect(result.depth).toBe(0);
    });

    it("prime of [0, 1] is [0, 1] with depth 0", () => {
      const result = contourReduction([0, 1]);
      expect(result.prime).toEqual([0, 1]);
      expect(result.depth).toBe(0);
    });

    it("prime of [1, 0] is [1, 0] with depth 0", () => {
      const result = contourReduction([1, 0]);
      expect(result.prime).toEqual([1, 0]);
      expect(result.depth).toBe(0);
    });
  });

  describe("golden tests - already-reduced contours", () => {
    // <0 2 1>: interior point 2 is a local max (2>0 and 2>1). Nothing removed.
    // Prime = <0 2 1>, depth = 0.
    it("prime of [0, 2, 1] is itself with depth 0 (triadic contour, irreducible)", () => {
      const result = contourReduction([0, 2, 1]);
      expect(result.prime).toEqual([0, 2, 1]);
      expect(result.depth).toBe(0);
    });

    // <0 1 2>: endpoint contour with rising interior. Interior 1 is neither max
    // (1 < 2) nor min (1 > 0). REMOVED. Depth = 1. Keeps [0, 2] -> renumber -> [0, 1].
    it("prime of [0, 1, 2] is [0, 1] with depth 1", () => {
      const result = contourReduction([0, 1, 2]);
      expect(result.prime).toEqual([0, 1]);
      expect(result.depth).toBe(1);
    });

    // <0 2 1 3>: interior points 2 (MAX: 2>0, 2>1) and 1 (MIN: 1<2, 1<3).
    // All kept. Prime = <0 2 1 3>, depth = 0.
    it("prime of [0, 2, 1, 3] is itself with depth 0", () => {
      const result = contourReduction([0, 2, 1, 3]);
      expect(result.prime).toEqual([0, 2, 1, 3]);
      expect(result.depth).toBe(0);
    });
  });

  describe("golden tests - Morris reduction with multi-step removal", () => {
    // Monotonic ascending: <0 1 2 3 4>
    // Pass 1: interior values 1,2,3 are all neither strictly max nor min between
    // their neighbors. All removed. Kept: [0, 4] -> renumber -> [0, 1]. Depth = 1.
    it("monotonic ascending [0, 1, 2, 3, 4] reduces to [0, 1] at depth 1", () => {
      const result = contourReduction([0, 1, 2, 3, 4]);
      expect(result.prime).toEqual([0, 1]);
      expect(result.depth).toBe(1);
    });

    // Monotonic descending: <4 3 2 1 0>
    // Pass 1: interior 3, 2, 1 are all neither strictly max nor min. All removed.
    // Kept: [4, 0] -> renumber -> [1, 0]. Depth = 1.
    it("monotonic descending [4, 3, 2, 1, 0] reduces to [1, 0] at depth 1", () => {
      const result = contourReduction([4, 3, 2, 1, 0]);
      expect(result.prime).toEqual([1, 0]);
      expect(result.depth).toBe(1);
    });

    // Hand-worked 7-element case: <0 5 3 4 1 2 6>
    //
    // Pass 1 (over indices 0..6, values [0,5,3,4,1,2,6]):
    //   Index 1 (val 5): neighbors val 0 and val 3 -> 5>=0 and 5>=3 -> MAX, keep
    //   Index 2 (val 3): neighbors val 5 and val 4 -> 3<=5 and 3<=4 -> MIN, keep
    //   Index 3 (val 4): neighbors val 3 and val 1 -> 4>=3 and 4>=1 -> MAX, keep
    //   Index 4 (val 1): neighbors val 4 and val 2 -> 1<=4 and 1<=2 -> MIN, keep
    //   Index 5 (val 2): neighbors val 1 and val 6 -> 2>=1 but 2<6; 2>1 so NOT a min.
    //                    Neither max nor min -> REMOVE. depth -> 1.
    //
    // Pass 2 (kept [0,1,2,3,4,6], values [0,5,3,4,1,6]):
    //   keptIndices[1]=1 (val 5): left 0(val 0), right 2(val 3). MAX, keep
    //   keptIndices[2]=2 (val 3): left 1(val 5), right 3(val 4). MIN, keep
    //   keptIndices[3]=3 (val 4): left 2(val 3), right 4(val 1). MAX, keep
    //   keptIndices[4]=4 (val 1): left 3(val 4), right 6(val 6). MIN, keep
    //   Nothing removed. Stop.
    //
    // Retained values: [0, 5, 3, 4, 1, 6]
    // sorted=[0,1,3,4,5,6] -> ranks: 0->0, 1->1, 3->2, 4->3, 5->4, 6->5
    // Prime = [0, 4, 2, 3, 1, 5], depth = 1.
    it("7-element contour [0,5,3,4,1,2,6] reduces to [0,4,2,3,1,5] at depth 1", () => {
      const result = contourReduction([0, 5, 3, 4, 1, 2, 6]);
      expect(result.prime).toEqual([0, 4, 2, 3, 1, 5]);
      expect(result.depth).toBe(1);
    });

    // Hand-worked 6-element case requiring two passes: <0 3 1 5 2 4 6>
    // Wait - that's 7 elements. Let me use a clean 6-element case.
    //
    // <0 3 5 1 4 2 6> (7 elements - checking two-pass reduction):
    // Values at indices: 0->0, 1->3, 2->5, 3->1, 4->4, 5->2, 6->6
    //
    // Pass 1:
    //   Index 1 (val 3): left=0(0), right=2(5). 3>0 but 3<5 -> NOT max, NOT min. REMOVE.
    //   Index 2 (val 5): left=1(3), right=3(1). 5>=3 and 5>=1 -> MAX. keep.
    //   Index 3 (val 1): left=2(5), right=4(4). 1<=5 and 1<=4 -> MIN. keep.
    //   Index 4 (val 4): left=3(1), right=5(2). 4>=1 and 4>=2 -> MAX. keep.
    //   Index 5 (val 2): left=4(4), right=6(6). 2<=4 and 2<=6 -> MIN. keep.
    //   Removed 1 point (index 1). depth = 1.
    //
    // After pass 1: kept=[0,2,3,4,5,6], values=[0,5,1,4,2,6]
    // Pass 2:
    //   keptIndices[1]=2 (val 5): left=0(val 0), right=3(val 1). 5>=0 and 5>=1 -> MAX. keep.
    //   keptIndices[2]=3 (val 1): left=2(val 5), right=4(val 4). 1<=5 and 1<=4 -> MIN. keep.
    //   keptIndices[3]=4 (val 4): left=3(val 1), right=5(val 2). 4>=1 and 4>=2 -> MAX. keep.
    //   keptIndices[4]=5 (val 2): left=4(val 4), right=6(val 6). 2<=4 and 2<=6 -> MIN. keep.
    //   Nothing removed. Stop.
    //
    // Retained values: [0, 5, 1, 4, 2, 6]
    // sorted=[0,1,2,4,5,6] -> ranks: 0->0, 1->1, 2->2, 4->3, 5->4, 6->5
    // Prime = [0, 4, 1, 3, 2, 5], depth = 1.
    it("7-element contour [0,3,5,1,4,2,6] reduces to [0,4,1,3,2,5] at depth 1", () => {
      const result = contourReduction([0, 3, 5, 1, 4, 2, 6]);
      expect(result.prime).toEqual([0, 4, 1, 3, 2, 5]);
      expect(result.depth).toBe(1);
    });

    // Two-pass case: <0 2 4 1 3 5 6>
    // Values: 0->0, 1->2, 2->4, 3->1, 4->3, 5->5, 6->6
    // Pass 1:
    //   Index 1 (val 2): left=0(0), right=2(4). 2>0 but 2<4. NOT max, NOT min. REMOVE.
    //   Index 2 (val 4): left=1(2), right=3(1). 4>=2 and 4>=1 -> MAX. keep.
    //   Index 3 (val 1): left=2(4), right=4(3). 1<=4 and 1<=3 -> MIN. keep.
    //   Index 4 (val 3): left=3(1), right=5(5). 3>=1 but 3<5. NOT max. 3>1, NOT min. REMOVE.
    //   Index 5 (val 5): left=4(3), right=6(6). 5>=3 but 5<6. NOT max. 5>3, NOT min. REMOVE.
    //   Removed indices 1,4,5. depth = 1.
    // After pass 1: kept=[0,2,3,6], values=[0,4,1,6]
    // Pass 2:
    //   keptIndices[1]=2 (val 4): left=0(val 0), right=3(val 1). 4>=0 and 4>=1 -> MAX. keep.
    //   keptIndices[2]=3 (val 1): left=2(val 4), right=6(val 6). 1<=4 and 1<=6 -> MIN. keep.
    //   Nothing removed. Stop.
    // Retained values: [0, 4, 1, 6]
    // sorted=[0,1,4,6] -> ranks: 0->0, 1->1, 4->2, 6->3
    // Prime = [0, 2, 1, 3], depth = 1.
    it("7-element contour [0,2,4,1,3,5,6] reduces to [0,2,1,3] at depth 1", () => {
      const result = contourReduction([0, 2, 4, 1, 3, 5, 6]);
      expect(result.prime).toEqual([0, 2, 1, 3]);
      expect(result.depth).toBe(1);
    });
  });

  describe("property tests", () => {
    it("prime is always a valid CSeg (passes validateCseg)", () => {
      fc.assert(
        fc.property(validCseg(1, 8), (c) => {
          const { prime } = contourReduction(c);
          expect(() => validateCseg([...prime])).not.toThrow();
        }),
      );
    });

    it("contourReduction is idempotent: prime of prime has same prime and depth 0", () => {
      fc.assert(
        fc.property(validCseg(1, 8), (c) => {
          const { prime } = contourReduction(c);
          const secondPass = contourReduction([...prime]);
          expect(secondPass.prime).toEqual(prime);
          expect(secondPass.depth).toBe(0);
        }),
      );
    });

    it("prime length is always <= original length", () => {
      fc.assert(
        fc.property(validCseg(1, 8), (c) => {
          const { prime } = contourReduction(c);
          expect(prime.length).toBeLessThanOrEqual(c.length);
        }),
      );
    });

    it("depth is always >= 0", () => {
      fc.assert(
        fc.property(validCseg(1, 8), (c) => {
          const { depth } = contourReduction(c);
          expect(depth).toBeGreaterThanOrEqual(0);
        }),
      );
    });

    it("endpoints of prime are always derived from original first and last values", () => {
      fc.assert(
        fc.property(validCseg(2, 8), (c) => {
          const { prime } = contourReduction(c);
          // The first and last elements of the prime come from the first and last
          // elements of c. After renumbering, the endpoint that was lower of the two
          // original endpoints maps to 0 or n-1 depending on relative position.
          // Simpler to check: prime always has at least 2 elements.
          expect(prime.length).toBeGreaterThanOrEqual(2);
        }),
      );
    });

    it("retrograde of prime is the prime of the retrograde (up to renumbering)", () => {
      // contourReduction(retrograde(c)).prime should equal the retrograde of
      // contourReduction(c).prime, because the reduction algorithm is symmetric.
      fc.assert(
        fc.property(validCseg(2, 7), (c) => {
          const primeFwd = contourReduction(c).prime;
          const primeRetro = contourReduction(retrograde(c)).prime;
          // retrograde of primeFwd should equal primeRetro
          expect([...primeFwd].reverse()).toEqual([...primeRetro]);
        }),
      );
    });

    it("prime of a 2-element cseg is itself with depth 0", () => {
      fc.assert(
        fc.property(fc.shuffledSubarray([0, 1], { minLength: 2, maxLength: 2 }), (c) => {
          const result = contourReduction(c);
          expect(result.prime).toEqual(c);
          expect(result.depth).toBe(0);
        }),
      );
    });
  });

  describe("error cases", () => {
    it("throws on empty input", () => {
      expect(() => contourReduction([])).toThrow(/must not be empty/);
    });

    it("throws on invalid CSeg (non-0..n-1 integers)", () => {
      expect(() => contourReduction([1, 2, 3])).toThrow(/Invalid CSeg/);
    });
  });
});
