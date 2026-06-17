import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cint } from "../src/cint.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("cint", () => {
  describe("golden tests", () => {
    // c = [0, 3, 1, 2]
    // CINT[i][j] = c[j] - c[i] for j > i, else 0
    // CINT[0][1] = 3-0 = 3
    // CINT[0][2] = 1-0 = 1
    // CINT[0][3] = 2-0 = 2
    // CINT[1][2] = 1-3 = -2
    // CINT[1][3] = 2-3 = -1
    // CINT[2][3] = 2-1 = 1
    it("produces correct CINT for [0, 3, 1, 2]", () => {
      expect(cint([0, 3, 1, 2])).toEqual([
        [0, 3, 1, 2],
        [0, 0, -2, -1],
        [0, 0, 0, 1],
        [0, 0, 0, 0],
      ]);
    });

    it("produces correct CINT for [0, 1, 2]", () => {
      // CINT[0][1]=1, CINT[0][2]=2, CINT[1][2]=1
      expect(cint([0, 1, 2])).toEqual([
        [0, 1, 2],
        [0, 0, 1],
        [0, 0, 0],
      ]);
    });

    it("returns 1x1 zero matrix for [0]", () => {
      expect(cint([0])).toEqual([[0]]);
    });
  });

  describe("property tests", () => {
    it("lower triangle and diagonal are always 0", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = cint(c);
          for (let i = 0; i < c.length; i++) {
            for (let j = 0; j <= i; j++) {
              expect(m[i]?.[j]).toBe(0);
            }
          }
        }),
      );
    });

    it("matrix has correct dimensions", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = cint(c);
          expect(m.length).toBe(c.length);
          for (const row of m) {
            expect(row.length).toBe(c.length);
          }
        }),
      );
    });

    it("CINT[i][j] = c[j] - c[i] for all j > i", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = cint(c);
          for (let i = 0; i < c.length; i++) {
            for (let j = i + 1; j < c.length; j++) {
              expect(m[i]?.[j]).toBe((c[j] ?? 0) - (c[i] ?? 0));
            }
          }
        }),
      );
    });
  });
});
