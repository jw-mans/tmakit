---
title: The mock engine
description: What createMock does — interception, auto-responses, pending requests, and CloudStorage simulation.
---

The heart of tmakit is `@tmakit/core`'s `createMock`. The devtools panel and the testing
utilities are both thin layers over the `MockController` it returns.

```ts
const mock = createMock({ bridge: { mockTelegramEnv, emitEvent }, defaults: { version: '8.0' } });
```

## What it handles

On every outgoing `postEvent`, the engine:

1. **Logs it.** A ring-buffer bridge log (`mock.logger`) records both directions with
   timestamps and payloads — the "network tab" for the bridge.
2. **Auto-answers instant requests.** Layout requests (`request_theme`,
   `request_viewport`, `request_safe_area`, …) get their `*_changed` reply immediately, so
   the app never hangs. Configurable via `autoResponder`.
3. **Queues stateful async flows.** Popup, invoice, QR, clipboard and biometry are _not_
   auto-answered — they become **pending requests** (`mock.requests`) that a human (or a
   test) resolves with a chosen outcome.
4. **Simulates CloudStorage.** `invoke_custom_method` storage calls are answered from an
   in-memory store (`mock.cloudStorage`), so storage works end-to-end in dev.

## The controller surface

```ts
mock.logger    // subscribe(), entries(), clear()
mock.requests  // pending(), subscribe(), resolve(id, responses), dismiss(id)
mock.cloudStorage // the in-memory Map (or undefined if disabled)
mock.emit(name, params) // push an event into the app (also logged)
```

## Why the split matters

Instant requests can be answered blindly; stateful flows can't — a popup's result depends
on _which button_ the user pressed. Modeling those as pending requests is what lets the
panel present a realistic dialog and lets tests assert a specific outcome. This same engine
powers unit tests (via `createMockBridge`) and E2E (via `createTmaPageDriver`), so behavior
is identical across dev, unit, and E2E.
