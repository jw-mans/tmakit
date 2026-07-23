---
title: Packages
description: The four packages, their exports, and where each is meant to run.
---

## `tma-kit` — runtime

Ships to production. Peers: `react` (>=18) and a bridge.

| Export | Kind | Purpose |
|---|---|---|
| `TmaProvider`, `useTmaBridge` | context | Inject the bridge for all hooks |
| `useViewport`, `useSafeArea` | hooks | Layout + CSS vars |
| `useSupports` | hook | Feature-gating |
| `useStoredState` | hook | Typed CloudStorage state |
| `usePayment`, `openInvoice` | hook + fn | Invoices by slug |
| `MainButton`, `SecondaryButton`, `BackButton`, `useBackButtonRouter` | components + hook | Native buttons |
| `useInitDataAuth` | hook | Client-side session exchange |
| `createCloudStorageAdapter`, `createLocalStorageAdapter`, `resolveStorageAdapter`, `createTypedStore` | fns | Low-level storage |

### `tma-kit/server` — Node only

| Export | Purpose |
|---|---|
| `validateInitData`, `parseInitData` | HMAC-SHA256 initData validation |
| `signSession`, `verifySession` | Minimal HS256 session tokens |
| `expressInitDataAuth` | Connect/Express middleware |

## `tma-devtools` — dev-only

`DevtoolsPanel` (the panel), plus `USER_PRESETS`, theme params, and `LaunchParamsOverride`
helpers. Peers: `react`, `react-dom`, and a bridge.

## `@tmakit/core` — shared

`createMock` (→ `MockController`), `createRequestManager`, `createCloudStorageSim`,
`createBridgeLogger`, `createAutoResponder`, `buildLaunchParams`, and version-gating
(`isMethodSupported`, `compareVersions`, `METHOD_MIN_VERSION`), plus protocol types. Pure
TS, no React.

## `@tmakit/testing` — dev-only

`createMockBridge` (unit tests) and `createTmaPageDriver` + `MOCK_GLOBAL_KEY` (Playwright).
Peer: `tma-kit`.

## Install matrix

```bash
npm i tma-kit                       # runtime
npm i -D tma-devtools @tmakit/testing
npm i @telegram-apps/bridge react   # peers (or @tma.js/bridge)
```
