# Changelog

## [0.2.0] - 2026-06-17

### Added

- `contourReduction(cseg)`: Morris's contour-reduction algorithm (Morris 1993). Iteratively
  prunes a CSeg to its prime form and reports the reduction depth. Returns
  `{ prime: readonly number[]; depth: number }`.

Note: Published to npm 2026-06-17 (v0.2.0).

## [0.1.0] - 2026-06-17

### Added

- Initial release.
- `cseg()`: map pitches to contour integers by rank.
- `validateCseg()`: validate a CSeg.
- `comMatrix()`: comparison matrix.
- `cas()`: contour adjacency series.
- `casVector()`: ascent/descent counts.
- `csim()`: contour similarity measure.
- `cint()`: contour interval matrix.
- `retrograde()`, `inversion()`, `retrogradeInversion()`: canonical transformations.
- `equivalenceClass()`: prime, retrograde, inversion, and retrograde-inversion forms.

Note: Published to npm 2026-06-17.
