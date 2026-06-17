# melodic-contour

<p align="center">
  <img src="assets/logo.png" alt="melodic-contour logo" width="160">
</p>

Melodic contour theory in TypeScript. Implements the core formalisms from Morris (1987), Friedmann (1985), and Marvin and Laprade (1987).

**npm release is pending** (requires manual 2FA OTP). Install from GitHub for now.

## What is contour theory?

Melodic contour describes the shape of a melody - its pattern of ups and downs - independent of specific intervals. A contour segment (CSeg) represents this shape as a sequence of ranked positions: the lowest note becomes 0, the next higher note 1, and so on.

## Install

```bash
npm install melodic-contour
```

## API

### `cseg(pitches: number[]): number[]`
Maps a pitch list to contour integers by rank. Throws if pitches repeat.

### `validateCseg(c: number[]): void`
Validates a CSeg (distinct integers 0..n-1). Throws if invalid.

### `comMatrix(c: number[]): number[][]`
Comparison Matrix. COM[i][j] = sign(c[j] - c[i]) in {-1, 0, +1}.

### `cas(c: number[]): number[]`
Contour Adjacency Series. Signs of successive differences.

### `casVector(c: number[]): [number, number]`
[ascents, descents] from the CAS.

### `csim(a: number[], b: number[]): number`
Contour Similarity. Fraction of matching entries above the COM matrix diagonal. Range [0, 1].

### `cint(c: number[]): number[][]`
Contour Interval Matrix. Upper triangle: CINT[i][j] = c[j] - c[i] for j > i.

### `retrograde(c: number[]): number[]`
Reverses a CSeg.

### `inversion(c: number[]): number[]`
Inverts a CSeg: maps each x to (n-1) - x.

### `retrogradeInversion(c: number[]): number[]`
Reversal of the inversion.

### `equivalenceClass(c: number[]): number[][]`
Returns unique forms among {Prime, Retrograde, Inversion, RetrogradeInversion}.

### `contourReduction(cseg: readonly number[]): ContourReductionResult`
Applies Morris's contour-reduction algorithm to reduce a CSeg to its prime form.

Returns `{ prime: readonly number[]; depth: number }` where:
- `prime` is the reduced CSeg (distinct integers 0..k-1 by relative height, always a valid CSeg).
- `depth` is the number of reduction passes that removed at least one interior point. An already-irreducible contour has depth 0.

**Algorithm** (Morris 1993): The first and last elements are always retained. On each pass, interior points that are neither a local maximum nor a local minimum among the currently-retained neighbors are removed. Each pass that removes at least one point increments the depth. Passes continue until the contour is stable.

**Examples:**

```typescript
import { contourReduction } from "melodic-contour";

// A monotonic contour reduces to just its endpoints:
contourReduction([0, 1, 2, 3, 4]); // { prime: [0, 1], depth: 1 }

// An arch contour is already irreducible:
contourReduction([0, 2, 1]);        // { prime: [0, 2, 1], depth: 0 }

// A 7-element contour with one non-extreme interior point:
contourReduction([0, 5, 3, 4, 1, 2, 6]); // { prime: [0, 4, 2, 3, 1, 5], depth: 1 }
```

**Reference:** Morris, R. D. (1993). New directions in the theory and analysis of musical contour. *Music Theory Spectrum*, 15(2), 205-228.

## Usage

```typescript
import { cseg, comMatrix, cas, casVector, csim, equivalenceClass } from "melodic-contour";

const c = cseg([60, 67, 62, 64]); // [0, 3, 1, 2]
const com = comMatrix(c);
const series = cas(c);            // [1, -1, 1]
const [asc, desc] = casVector(c); // [2, 1]
const sim = csim(c, c);           // 1
const forms = equivalenceClass(c); // [[0,3,1,2],[2,1,3,0],[3,0,2,1],[1,2,0,3]]
```

## References

- Morris, R. D. (1987). *Composition with Pitch-Classes*. Yale University Press.
- Friedmann, M. L. (1985). A methodology for the discussion of contour: Its application to Schoenberg's music. *Journal of Music Theory*, 29(2), 223-248.
- Marvin, E. W., and Laprade, P. A. (1987). Relating musical contours: Extensions of a theory for contour. *Journal of Music Theory*, 31(2), 225-267.
