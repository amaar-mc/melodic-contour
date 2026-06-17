import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cas, casVector } from "../src/cas.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("cas", () => {
  describe("golden tests", () => {
    // c = [0, 3, 1, 2]
    // sign(3-0) = 1
    // sign(1-3) = -1
    // sign(2-1) = 1
    // => [1, -1, 1]
    it("produces correct CAS for [0, 3, 1, 2]", () => {
      expect(cas([0, 3, 1, 2])).toEqual([1, -1, 1]);
    });

    it("all ascents for [0, 1, 2, 3]", () => {
      expect(cas([0, 1, 2, 3])).toEqual([1, 1, 1]);
    });

    it("all descents for [3, 2, 1, 0]", () => {
      expect(cas([3, 2, 1, 0])).toEqual([-1, -1, -1]);
    });

    it("single step ascent [0, 1]", () => {
      expect(cas([0, 1])).toEqual([1]);
    });

    it("single step descent [1, 0]", () => {
      expect(cas([1, 0])).toEqual([-1]);
    });
  });

  describe("property tests", () => {
    it("cas length is always n-1 for a cseg of length n", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          expect(cas(c).length).toBe(c.length - 1);
        }),
      );
    });

    it("all cas values are -1 or +1 for valid CSeg", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          for (const v of cas(c)) {
            expect(Math.abs(v)).toBe(1);
          }
        }),
      );
    });
  });
});

describe("casVector", () => {
  describe("golden tests", () => {
    // cas([0,3,1,2]) = [1,-1,1] => 2 ascents, 1 descent
    it("produces correct CAS vector for [0, 3, 1, 2]", () => {
      expect(casVector([0, 3, 1, 2])).toEqual([2, 1]);
    });

    it("all ascents [0, 1, 2, 3] => [3, 0]", () => {
      expect(casVector([0, 1, 2, 3])).toEqual([3, 0]);
    });

    it("all descents [3, 2, 1, 0] => [0, 3]", () => {
      expect(casVector([3, 2, 1, 0])).toEqual([0, 3]);
    });

    it("single step ascent [0, 1] => [1, 0]", () => {
      expect(casVector([0, 1])).toEqual([1, 0]);
    });

    it("single step descent [1, 0] => [0, 1]", () => {
      expect(casVector([1, 0])).toEqual([0, 1]);
    });
  });

  describe("property tests", () => {
    it("ascents + descents always equals n-1 for valid CSeg", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const [asc, desc] = casVector(c);
          expect(asc + desc).toBe(c.length - 1);
        }),
      );
    });

    it("casVector components are non-negative", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const [asc, desc] = casVector(c);
          expect(asc).toBeGreaterThanOrEqual(0);
          expect(desc).toBeGreaterThanOrEqual(0);
        }),
      );
    });
  });
});
