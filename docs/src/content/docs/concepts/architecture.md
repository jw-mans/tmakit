---
title: Architecture
description: The two-natured design, the package graph, and the hard rules that shape everything.
---

tmakit is a monorepo of packages with **two different natures**, kept strictly apart.

## Two natures, never merged

- **Dev-only** (`tma-devtools`, `@tmakit/testing`) — a rich Telegram client mock and the
  tooling around it. Lives in `devDependencies`, mounted behind `import.meta.env.DEV`, and
  **tree-shaken out of production entirely**.
- **Runtime** (`tma-kit`) — opinionated helpers that ship to production.

Both are built on a shared, React-free core (`@tmakit/core`) that holds the mock engine
and bridge-protocol types.

```
@tmakit/core ◄── tma-kit          (runtime)
      ▲   ▲
      │   └──── tma-devtools       (dev-only)
      └──────── @tmakit/testing    (dev-only)  ──► tma-kit (types only)
```

There is **no edge from a runtime package to a dev package**. The mock never reaches
production, not even transitively.

## The hard rules

These constraints aren't style — they're what make the toolkit safe to ship:

1. **Dev and runtime never share a bundle.** Mock code is dead weight and a security hole
   in production.
2. **The bridge is injected, never imported.** See [SDK-agnostic injection](/tmakit/concepts/sdk-agnostic/).
3. **`initData` is validated only on the server.** The client is not a trusted party.
4. **Feature-gate via `isSupported`**, not by comparing version numbers in your head.
5. **Everything is tree-shakeable** (`"sideEffects": false`). Mini Apps load over mobile
   networks — every KB shows.
6. **`initData` is exchanged for a session once**, not sent on every request.

## Server code is isolated

Auth needs the bot token, which is a secret. So the server-side validation lives in a
separate entry point, `tma-kit/server` (Node runtime). Client code never imports it, so
`node:crypto` and the validation logic never end up in the browser bundle.

## Where the runtime gets the bridge

Runtime hooks read the bridge from React context via `TmaProvider`. Your app supplies the
bridge functions from whatever SDK it uses — so the same `tma-kit` works whether you chose
`@telegram-apps/*` or `@tma.js/*`.
