# Static analysis report (ESLint + TypeScript)

This report captures the failures observed when running the repository’s configured static analysis commands after the recent dependency updates.

## Commands executed

From `vision-camera-code-scanner-211599/`:

- `yarn lint`
- `yarn typescript` (runs `tsc --noEmit`)

---

## 1) ESLint failure (`yarn lint`)

### Symptom
ESLint crashes with a runtime exception (not a lint rule violation output).

### Error
- `TypeError: context.getScope is not a function`
- ESLint version: `9.39.2`
- Rule: `jest/no-disabled-tests`

### Where it occurs
- While linting: `example/index.tsx:7`

### Stack trace excerpt (key lines)
- `eslint-plugin-jest/lib/rules/utils/parseJestFnCall.js:394:48`
- `eslint-plugin-jest/lib/rules/no-disabled-tests.js:36:55`

### Notes (likely cause)
This looks like an incompatibility between ESLint v9 and `eslint-plugin-jest` (pulled in via `@react-native-community/eslint-config`). The plugin expects `context.getScope`, which is not available in ESLint v9’s rule context API.

---

## 2) TypeScript failure (`yarn typescript`)

`tsc --noEmit` reports the following errors:

### A) Example app Frame type mismatch
- File: `example/src/App.tsx`
- Location: `(37,11)`
- Error: `TS2322`

Summary: the `frameProcessor` prop type expects a `Frame` from one installed `react-native-vision-camera` version, but the `useScanBarcodes` hook returns a processor typed against a different `Frame` from another installed version.

The error explicitly shows two different module paths:
- Root: `node_modules/react-native-vision-camera/.../types/Frame`
- Example: `example/node_modules/react-native-vision-camera/.../Frame`

Likely cause: monorepo has two different versions installed:
- Root `package.json`: `react-native-vision-camera` `^4.7.3`
- Example `package.json`: `react-native-vision-camera` `^2.9.4`

### B) `verbatimModuleSyntax` type-only import errors
- File: `src/hook.tsx`
- Errors:
  - `(1,10)`: `TS1484` — `Frame` must be imported using `import type`
  - `(5,10)`: `TS1484` — `Barcode` must be imported using `import type`
  - `(5,34)`: `TS1484` — `CodeScannerOptions` must be imported using `import type`

Cause: `tsconfig.json` has `"verbatimModuleSyntax": true`.

### C) Frame processor return type mismatch
- File: `src/hook.tsx`
- Location: `(19,11)`
- Error: `TS2322`
- Summary: `useFrameProcessor(...)` returns a `ReadonlyFrameProcessor` (from vision-camera), but the hook signature declares it returns `(frame: Frame) => void`.

---

## Files implicated

- `eslint.config.cjs` (config in use; extends `@react-native-community` and `prettier`)
- `example/index.tsx` (file that triggers ESLint crash with jest rule)
- `tsconfig.json` (enables `verbatimModuleSyntax`)
- `src/hook.tsx` (type-only import errors + frameProcessor type mismatch)
- `example/src/App.tsx` (two-vision-camera-versions `Frame` mismatch)
- `package.json` and `example/package.json` (different `react-native-vision-camera` versions)
