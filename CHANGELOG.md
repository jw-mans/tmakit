# Changelog

All notable changes to tmakit are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Initial development. Nothing published to npm yet.

### Added

- **`@tmakit/core`** — SDK-agnostic mock engine (`createMock`): bridge interception +
  logging, auto-responses, pending-request manager, in-memory CloudStorage simulation, and
  version-gating (`isMethodSupported`, `METHOD_MIN_VERSION`).
- **`tma-kit`** — runtime hooks and helpers: `useViewport`, `useSafeArea`, `useSupports`,
  `useStoredState`, `usePayment`, declarative `MainButton`/`SecondaryButton`/`BackButton`,
  `useBackButtonRouter`, `useInitDataAuth`, and typed storage adapters.
- **`tma-kit/server`** — server-only auth: `validateInitData`, `signSession`/`verifySession`,
  `expressInitDataAuth`.
- **`tma-devtools`** — dev-only panel with log / user / theme / viewport / buttons / async /
  platform tabs.
- **`@tmakit/testing`** — `createMockBridge` (unit tests) and `createTmaPageDriver`
  (Playwright).
- Documentation site (Astro Starlight) and per-package READMEs.

[Unreleased]: https://github.com/jw-mans/tmakit
