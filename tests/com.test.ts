import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { comMatrix } from "../src/com.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("comMatrix", () => {
  describe("golden tests", () => {
    // c = [0, 3, 1, 2], n = 4
    //
    // COM[i][j] = sign(c[j] - c[i]):
    // COM[0][0] = sign(0-0) = 0
    // COM[0][1] = sign(3-0) = 1
    // COM[0][2] = sign(1-0) = 1
    // COM[0][3] = sign(2-0) = 1
    // COM[1][0] = sign(0-3) = -1
    // COM[1][1] = sign(3-3) = 0
    // COM[1][2] = sign(1-3) = -1
    // COM[1][3] = sign(2-3) = -1
    // COM[2][0] = sign(0-1) = -1
    // COM[2][1] = sign(3-1) = 1
    // COM[2][2] = sign(1-1) = 0
    // COM[2][3] = sign(2-1) = 1
    // COM[3][0] = sign(0-2) = -1
    // COM[3][1] = sign(3-2) = 1
    // COM[3][2] = sign(1-2) = -1
    // COM[3][3] = sign(2-2) = 0
    it("produces correct COM matrix for [0, 3, 1, 2]", () => {
      expect(comMatrix([0, 3, 1, 2])).toEqual([
        [0, 1, 1, 1],
        [-1, 0, -1, -1],
        [-1, 1, 0, 1],
        [-1, 1, -1, 0],
      ]);
    });

    it("produces identity-like matrix for ascending cseg [0, 1, 2]", () => {
      expect(comMatrix([0, 1, 2])).toEqual([
        [0, 1, 1],
        [-1, 0, 1],
        [-1, -1, 0],
      ]);
    });

    it("produces correct matrix for descending [2, 1, 0]", () => {
      expect(comMatrix([2, 1, 0])).toEqual([
        [0, -1, -1],
        [1, 0, -1],
        [1, 1, 0],
      ]);
    });

    it("returns 1x1 zero matrix for single-element cseg [0]", () => {
      expect(comMatrix([0])).toEqual([[0]]);
    });
  });

  describe("property tests", () => {
    it("diagonal is always 0", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = comMatrix(c);
          for (let i = 0; i < c.length; i++) {
            expect(m[i]?.[i]).toBe(0);
          }
        }),
      );
    });

    it("matrix is antisymmetric: COM[i][j] + COM[j][i] === 0", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = comMatrix(c);
          for (let i = 0; i < c.length; i++) {
            for (let j = 0; j < c.length; j++) {
              expect((m[i]?.[j] ?? 0) + (m[j]?.[i] ?? 0)).toBe(0);
            }
          }
        }),
      );
    });

    it("all off-diagonal entries are -1 or +1 for valid CSeg", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = comMatrix(c);
          for (let i = 0; i < c.length; i++) {
            for (let j = 0; j < c.length; j++) {
              if (i !== j) {
                expect(Math.abs(m[i]?.[j] ?? 0)).toBe(1);
              }
            }
          }
        }),
      );
    });

    it("matrix has correct dimensions", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = comMatrix(c);
          expect(m.length).toBe(c.length);
          for (const row of m) {
            expect(row.length).toBe(c.length);
          }
        }),
      );
    });
  });
});
