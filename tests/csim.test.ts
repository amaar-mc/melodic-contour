import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { csim } from "../src/csim.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("csim", () => {
  describe("golden tests", () => {
    // csim([0,3,1,2], [0,3,1,2])
    // All 6 pairs (i<j) match: 6/6 = 1
    it("self-similarity of [0, 3, 1, 2] is 1", () => {
      expect(csim([0, 3, 1, 2], [0, 3, 1, 2])).toBe(1);
    });

    // csim([0,1], [1,0])
    // n=2, 1 pair: (0,1)
    // COM_a[0][1] = sign(1-0) = 1
    // COM_b[0][1] = sign(0-1) = -1
    // no match => 0/1 = 0
    it("csim([0,1], [1,0]) is 0 (opposite contours)", () => {
      expect(csim([0, 1], [1, 0])).toBe(0);
    });

    it("self-similarity of [0, 1] is 1", () => {
      expect(csim([0, 1], [0, 1])).toBe(1);
    });

    it("self-similarity of [2, 0, 1] is 1", () => {
      expect(csim([2, 0, 1], [2, 0, 1])).toBe(1);
    });

    // csim([0,1,2], [2,1,0])
    // n=3, 3 pairs: (0,1), (0,2), (1,2)
    // COM_a: sign(1-0)=1, sign(2-0)=1, sign(2-1)=1
    // COM_b: sign(1-2)=-1, sign(0-2)=-1, sign(0-1)=-1
    // matches: 0 => 0/3 = 0
    it("csim of ascending vs descending [0,1,2] and [2,1,0] is 0", () => {
      expect(csim([0, 1, 2], [2, 1, 0])).toBe(0);
    });

    it("throws if lengths differ", () => {
      expect(() => csim([0, 1], [0, 1, 2])).toThrow(/equal length/);
    });
  });

  describe("property tests", () => {
    it("csim(a, a) === 1 for any valid CSeg", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          expect(csim(c, c)).toBe(1);
        }),
      );
    });

    it("csim is symmetric: csim(a, b) === csim(b, a)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 8 }).chain((n) =>
            fc.tuple(
              fc.shuffledSubarray(
                Array.from({ length: n }, (_, i) => i),
                { minLength: n, maxLength: n },
              ),
              fc.shuffledSubarray(
                Array.from({ length: n }, (_, i) => i),
                { minLength: n, maxLength: n },
              ),
            ),
          ),
          ([a, b]) => {
            expect(csim(a, b)).toBeCloseTo(csim(b, a), 10);
          },
        ),
      );
    });

    it("csim is in range [0, 1]", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const sim = csim(c, c);
          expect(sim).toBeGreaterThanOrEqual(0);
          expect(sim).toBeLessThanOrEqual(1);
        }),
      );
    });
  });
});
