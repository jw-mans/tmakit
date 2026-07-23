---
title: Introduction
description: What tmakit is, what's in the box, and who it's for.
---

**tmakit** is a toolkit for building [Telegram Mini Apps](https://core.telegram.org/bots/webapps).
It doesn't wrap an SDK — it adds the layers _around_ one: a dev-time client mock, runtime
helpers the SDK deliberately leaves out, and testing utilities.

## The packages

| Package | Kind | Role |
|---|---|---|
| `tma-kit` | runtime (prod) | Hooks & helpers: auth, viewport/safe-area, storage, payments, navigation, feature-gating. Plus `tma-kit/server` for initData validation. |
| `tma-devtools` | dev-only | A floating panel and a full Telegram client mock. Stripped from production. |
| `@tmakit/core` | shared | The SDK-agnostic mock engine and bridge-protocol types the others build on. |
| `@tmakit/testing` | dev-only | A unit-test bridge double and a Playwright driver, on the same mock engine. |

## Why it exists

The official SDK is fine. The friction is everywhere else: your app crashes outside
Telegram, there's no way to emulate a user, you can't see what the app sends the client,
`initData` validation is hand-rolled HMAC, viewport jumps on expand, CloudStorage is
stringly-typed, and methods silently break on old clients.

tmakit closes that gap while respecting a few hard rules:

- **Dev and runtime never share a bundle** — the mock is stripped from production.
- **SDK-agnostic** — the bridge is injected, so it works with `@telegram-apps/*` or `@tma.js/*`.
- **`initData` is validated only on the server.**
- **Feature-gate via `isSupported`, not by comparing versions by hand.**

## Where to go next

- New here? Start with [Getting started](/tmakit/start/getting-started/).
- Prefer learning by doing? Follow the [tutorial](/tmakit/start/tutorial/).
- Want the mental model first? Read [Architecture](/tmakit/concepts/architecture/).
