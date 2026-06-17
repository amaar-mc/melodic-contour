# melodic-contour

TypeScript library implementing melodic contour theory.

## Key Facts

- Zero runtime dependencies
- Dual ESM + CJS build via tsup
- Vitest for tests, fast-check for property tests
- Biome 2.x for lint/format

## Commands

- `npm test` - run tests
- `npm run typecheck` - check types
- `npm run lint` - lint
- `npm run build` - build dist/
- `npm run example` - run the demo

## Rules

- All functions pure, strictly typed
- No default parameter values
- No TODO/FIXME in code
- No runtime dependencies
- Block bodies in forEach callbacks (biome requirement)
