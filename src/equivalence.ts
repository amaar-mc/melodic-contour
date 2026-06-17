import { validateCseg } from "./cseg.js";

/**
 * Returns the retrograde (reversal) of a CSeg.
 */
export function retrograde(c: number[]): number[] {
  validateCseg(c);
  return [...c].reverse();
}

/**
 * Returns the inversion of a CSeg.
 * Inversion maps each element x to (n-1) - x,
 * where n is the length of the CSeg.
 */
export function inversion(c: number[]): number[] {
  validateCseg(c);
  const n = c.length;
  return c.map((x) => n - 1 - x);
}

/**
 * Returns the retrograde-inversion of a CSeg:
 * the reversal of the inversion.
 */
export function retrogradeInversion(c: number[]): number[] {
  return retrograde(inversion(c));
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Returns the equivalence class of a CSeg: the unique members among
 * {Prime, Retrograde, Inversion, RetrogradeInversion}.
 *
 * Order: Prime first, then any unique variants.
 * The equivalence class may have 1, 2, or 4 members.
 */
export function equivalenceClass(c: number[]): number[][] {
  validateCseg(c);
  const forms: number[][] = [c, retrograde(c), inversion(c), retrogradeInversion(c)];
  const unique: number[][] = [];
  for (const form of forms) {
    const isDuplicate = unique.some((u) => arraysEqual(u, form));
    if (!isDuplicate) {
      unique.push(form);
    }
  }
  return unique;
}
