# Architecture

## Definitions

All implementations follow these precise definitions from the literature.

### Contour Segment (CSeg)

A CSeg is a sequence of distinct non-negative integers forming the set {0, 1, ..., n-1} for some n. Given a list of pitches, the CSeg is formed by ranking: the lowest pitch receives rank 0, the next distinct pitch rank 1, etc., preserving the original order.

Example: pitches [60, 67, 62, 64] sort to [60, 62, 64, 67], giving ranks 60->0, 62->1, 64->2, 67->3. Preserving order: [0, 3, 1, 2].

Repeated pitches are rejected (they cannot form distinct contour integers).

### Comparison Matrix (COM)

COM[i][j] = sign(c[j] - c[i]) in {-1, 0, +1}.

Properties:
- Diagonal is always 0 (COM[i][i] = 0).
- Antisymmetric: COM[j][i] = -COM[i][j].
- For a valid CSeg with distinct integers, all off-diagonal entries are nonzero.

Reference: Morris (1987), Friedmann (1985).

### Contour Adjacency Series (CAS)

CAS[i] = sign(c[i+1] - c[i]) for i = 0..n-2. Length n-1.

Reference: Friedmann (1985).

### CAS Vector

[ascents, descents] where ascents = count(CAS == +1) and descents = count(CAS == -1).

### Contour Similarity (CSIM)

For two CSeg a and b of equal length n:

CSIM(a, b) = |{(i,j) : i < j and COM_a[i][j] = COM_b[i][j]}| / (n*(n-1)/2)

Range [0, 1]. Equal to 1 when a and b are identical.

Reference: Marvin and Laprade (1987).

### Contour Interval Matrix (CINT)

CINT[i][j] = c[j] - c[i] for j > i. Upper triangle only; lower triangle and diagonal are 0.

Reference: Morris (1987).

### Equivalence Class

Four canonical forms of a CSeg:
1. Prime (P): the CSeg itself.
2. Retrograde (R): reverse(P).
3. Inversion (I): map each x to (n-1) - x.
4. Retrograde-Inversion (RI): reverse(I).

The equivalence class is the set of unique forms among {P, R, I, RI}.

## Module Layout

- `src/cseg.ts` - CSeg construction and validation
- `src/com.ts` - COM matrix
- `src/cas.ts` - CAS and CAS vector
- `src/csim.ts` - Contour similarity
- `src/cint.ts` - Contour interval matrix
- `src/equivalence.ts` - Retrograde, inversion, retrograde-inversion, equivalence class
- `src/index.ts` - Public API surface

## References

- Morris, R. D. (1987). *Composition with Pitch-Classes*. Yale University Press.
- Friedmann, M. L. (1985). A methodology for the discussion of contour: Its application to Schoenberg's music. *Journal of Music Theory*, 29(2), 223-248.
- Marvin, E. W., and Laprade, P. A. (1987). Relating musical contours: Extensions of a theory for contour. *Journal of Music Theory*, 31(2), 225-267.
