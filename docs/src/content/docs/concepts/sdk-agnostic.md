---
title: SDK-agnostic injection
description: Why tmakit never imports a bridge, and how injection keeps it working across SDKs.
---

The Telegram ecosystem has more than one SDK — `@telegram-apps/*` and the rebranded
`@tma.js/*` — and they share the same [bridge protocol](/tmakit/concepts/bridge-protocol/)
but differ in surface details. tmakit never imports a specific one. Instead, **you inject
the bridge functions.**

## Core: inject `mockTelegramEnv` + `emitEvent`

`@tmakit/core`'s `createMock` takes the bridge functions rather than importing them:

```ts
import { mockTelegramEnv, emitEvent } from '@telegram-apps/bridge'; // or @tma.js/bridge
import { createMock } from '@tmakit/core';

const mock = createMock({ bridge: { mockTelegramEnv, emitEvent } });
```

Because the app and the mock share the **same bridge instance**, an event emitted by the
mock reaches the app's `on(...)` listeners — guaranteed, no matter which SDK.

Core also normalizes the one real difference between the SDKs: the `onEvent` signature.
`@telegram-apps/bridge` passes a tuple `(method, payload)`; `@tma.js/bridge` passes an
object `{ name | event, params }`. Core detects the shape at runtime, so it doesn't need
to know which bridge is in play.

## Runtime: inject `on` / `postEvent` via `TmaProvider`

`tma-kit` hooks read the bridge from context:

```tsx
import { on, postEvent, isSupported } from '@telegram-apps/bridge';
import { TmaProvider } from 'tma-kit';

<TmaProvider bridge={{ on, postEvent, isSupported, version: '8.0' }}>
  <App />
</TmaProvider>;
```

Only `on` is required. `postEvent`, `isSupported` and `version` unlock more behavior.
Swapping SDKs is a one-line change at the provider — nothing inside `tma-kit` changes.

## What "SDK-agnostic" means here

It means tmakit works whether your project chose `@telegram-apps` or `@tma.js`. It does
**not** mean mixing two bridges in one app — a given app uses one, and both the app and
tmakit share it.
