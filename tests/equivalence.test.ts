import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { cas } from "../src/cas.js";
import { comMatrix } from "../src/com.js";
import {
  equivalenceClass,
  inversion,
  retrograde,
  retrogradeInversion,
} from "../src/equivalence.js";

// Generates a valid CSeg of length n (a shuffled permutation of 0..n-1).
const validCseg = (minLen = 2, maxLen = 8) =>
  fc.integer({ min: minLen, max: maxLen }).chain((n) =>
    fc.shuffledSubarray(
      Array.from({ length: n }, (_, i) => i),
      { minLength: n, maxLength: n },
    ),
  );

describe("retrograde", () => {
  describe("golden tests", () => {
    // retrograde([0,3,1,2]) = [2,1,3,0]
    it("reverses [0, 3, 1, 2] to [2, 1, 3, 0]", () => {
      expect(retrograde([0, 3, 1, 2])).toEqual([2, 1, 3, 0]);
    });

    it("reverses [0, 1, 2] to [2, 1, 0]", () => {
      expect(retrograde([0, 1, 2])).toEqual([2, 1, 0]);
    });

    it("reverses [0] to [0]", () => {
      expect(retrograde([0])).toEqual([0]);
    });
  });

  describe("property tests", () => {
    it("retrograde is an involution: retrograde(retrograde(c)) deep-equals c", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          expect(retrograde(retrograde(c))).toEqual(c);
        }),
      );
    });
  });
});

describe("inversion", () => {
  describe("golden tests", () => {
    // inversion([0,3,1,2]) where n=4: map x -> 3-x
    // [3-0, 3-3, 3-1, 3-2] = [3, 0, 2, 1]
    it("inverts [0, 3, 1, 2] to [3, 0, 2, 1]", () => {
      expect(inversion([0, 3, 1, 2])).toEqual([3, 0, 2, 1]);
    });

    it("inverts [0, 1, 2] to [2, 1, 0]", () => {
      expect(inversion([0, 1, 2])).toEqual([2, 1, 0]);
    });

    it("inverts [0] to [0]", () => {
      expect(inversion([0])).toEqual([0]);
    });
  });

  describe("property tests", () => {
    it("inversion is an involution: inversion(inversion(c)) deep-equals c", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          expect(inversion(inversion(c))).toEqual(c);
        }),
      );
    });

    it("inversion preserves length", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          expect(inversion(c).length).toBe(c.length);
        }),
      );
    });
  });
});

describe("retrogradeInversion", () => {
  describe("golden tests", () => {
    // retrogradeInversion([0,3,1,2]):
    // inversion = [3,0,2,1]
    // reverse([3,0,2,1]) = [1,2,0,3]
    it("retrograde-inverts [0, 3, 1, 2] to [1, 2, 0, 3]", () => {
      expect(retrogradeInversion([0, 3, 1, 2])).toEqual([1, 2, 0, 3]);
    });

    it("retrograde-inverts [0, 1, 2] to [0, 1, 2] (palindrome under RI)", () => {
      // inversion([0,1,2]) = [2,1,0], reverse = [0,1,2]
      expect(retrogradeInversion([0, 1, 2])).toEqual([0, 1, 2]);
    });
  });
});

describe("equivalenceClass", () => {
  describe("golden tests", () => {
    // [0,3,1,2]: all 4 forms are distinct
    it("returns all 4 distinct forms for [0, 3, 1, 2]", () => {
      expect(equivalenceClass([0, 3, 1, 2])).toEqual([
        [0, 3, 1, 2],
        [2, 1, 3, 0],
        [3, 0, 2, 1],
        [1, 2, 0, 3],
      ]);
    });

    // [0,1]: R=[1,0], I=[1,0], RI=[0,1] => only 2 unique forms
    it("deduplicates when forms coincide for [0, 1]", () => {
      const ec = equivalenceClass([0, 1]);
      // P=[0,1], R=[1,0], I=[1,0], RI=[0,1] => unique: [0,1], [1,0]
      expect(ec).toHaveLength(2);
      expect(ec[0]).toEqual([0, 1]);
      expect(ec[1]).toEqual([1, 0]);
    });

    it("prime form is always first", () => {
      const c = [0, 3, 1, 2];
      expect(equivalenceClass(c)[0]).toEqual(c);
    });
  });

  describe("property tests", () => {
    it("prime form is always the first element", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const ec = equivalenceClass(c);
          expect(ec[0]).toEqual(c);
        }),
      );
    });

    it("equivalence class has 1, 2, or 4 members", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const ec = equivalenceClass(c);
          expect([1, 2, 4]).toContain(ec.length);
        }),
      );
    });

    it("all members have the same length as the original", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          for (const form of equivalenceClass(c)) {
            expect(form.length).toBe(c.length);
          }
        }),
      );
    });
  });
});

describe("COM matrix properties", () => {
  describe("property tests", () => {
    it("comMatrix is antisymmetric: COM[i][j] + COM[j][i] === 0", () => {
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

    it("comMatrix has zero diagonal: COM[i][i] === 0", () => {
      fc.assert(
        fc.property(validCseg(), (c) => {
          const m = comMatrix(c);
          for (let i = 0; i < c.length; i++) {
            expect(m[i]?.[i]).toBe(0);
          }
        }),
      );
    });
  });
});

describe("CAS length property", () => {
  it("cas(c).length === c.length - 1", () => {
    fc.assert(
      fc.property(validCseg(), (c) => {
        expect(cas(c).length).toBe(c.length - 1);
      }),
    );
  });
});
