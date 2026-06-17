import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cseg, validateCseg } from "../src/cseg.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("cseg", () => {
  describe("golden tests", () => {
    it("maps pitches to contour integers by rank", () => {
      expect(cseg([60, 67, 62, 64])).toEqual([0, 3, 1, 2]);
    });

    it("ascending pitches produce ascending integers", () => {
      expect(cseg([60, 62, 64, 67])).toEqual([0, 1, 2, 3]);
    });

    it("descending pitches produce descending integers", () => {
      expect(cseg([67, 64, 62, 60])).toEqual([3, 2, 1, 0]);
    });

    it("two-note ascent", () => {
      expect(cseg([60, 67])).toEqual([0, 1]);
    });

    it("two-note descent", () => {
      expect(cseg([67, 60])).toEqual([1, 0]);
    });

    it("single pitch", () => {
      expect(cseg([60])).toEqual([0]);
    });
  });

  describe("error cases", () => {
    it("throws on repeated pitch", () => {
      expect(() => cseg([60, 60, 62])).toThrow(/Repeated pitch/);
    });

    it("throws on empty input", () => {
      expect(() => cseg([])).toThrow(/must not be empty/);
    });
  });
});

describe("validateCseg", () => {
  describe("golden tests", () => {
    it("accepts [0, 3, 1, 2]", () => {
      expect(() => validateCseg([0, 3, 1, 2])).not.toThrow();
    });

    it("accepts [0]", () => {
      expect(() => validateCseg([0])).not.toThrow();
    });

    it("accepts [0, 1, 2]", () => {
      expect(() => validateCseg([0, 1, 2])).not.toThrow();
    });

    it("rejects empty array", () => {
      expect(() => validateCseg([])).toThrow(/must not be empty/);
    });

    it("rejects array with duplicate", () => {
      expect(() => validateCseg([0, 1, 1])).toThrow(/Invalid CSeg/);
    });

    it("rejects array not forming 0..n-1", () => {
      expect(() => validateCseg([1, 2, 3])).toThrow(/Invalid CSeg/);
    });

    it("rejects array with gap", () => {
      expect(() => validateCseg([0, 2])).toThrow(/Invalid CSeg/);
    });
  });

  describe("property tests", () => {
    it("cseg output always validates", () => {
      fc.assert(
        fc.property(
          fc
            .array(fc.integer({ min: 0, max: 127 }), { minLength: 1, maxLength: 10 })
            .filter((arr) => new Set(arr).size === arr.length),
          (pitches) => {
            expect(() => validateCseg(cseg(pitches))).not.toThrow();
          },
        ),
      );
    });

    it("valid csegs always pass validateCseg", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          expect(() => validateCseg(c)).not.toThrow();
        }),
      );
    });
  });
});
