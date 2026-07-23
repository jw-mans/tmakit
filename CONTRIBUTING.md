# Contributing to tmakit

Thanks for your interest! This is an npm-workspaces monorepo.

## Setup

```bash
npm install     # install all workspaces
npm run dev     # playground (Vite) with the devtools panel
```

## Layout

```
packages/
  core/       @tmakit/core   — mock engine + protocol types (pure TS)
  kit/        tma-kit        — runtime hooks/helpers (+ /server subpath)
  devtools/   tma-devtools   — dev-only panel
  testing/    @tmakit/testing — unit + E2E test utilities
playground/   Vite React app used for manual testing and E2E
docs/         Astro Starlight documentation site (standalone)
```

Dependency rule: **no runtime package may depend on a dev-only package.** `tma-kit` never
imports `tma-devtools` or `@tmakit/testing`.

## Scripts

```bash
npm run typecheck   # tsc --noEmit across packages
npm test            # Vitest unit tests
npm run build       # build all packages (Vite JS + tsc .d.ts)
npm run test:e2e    # Playwright (first: npx playwright install chromium)
npm run format      # prettier
```

## Conventions

- **Keep dev and runtime apart.** Mock code must be tree-shakeable out of production.
- **Never import a bridge** — inject it (see the SDK-agnostic concept in the docs).
- **`initData` validation stays server-side** (`tma-kit/server`).
- **Feature-gate via `isSupported`**; add new method versions to
  `packages/core/src/support/versionMap.ts`, confirmed against the Telegram changelog.
- Add a `.test.tsx` under a package's `test/` for behavior changes; run `npm test`.
- Every published package keeps a README and its `exports` in sync.

## Docs

The site lives in `docs/` (standalone Astro project):

```bash
cd docs && npm install && npm run dev
```

Content is organized by [Diátaxis](https://diataxis.fr/): Start, Concepts, Guides,
Reference.
