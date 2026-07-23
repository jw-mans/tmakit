# @tmakit/core

The SDK-agnostic **mock engine** and bridge-protocol types that power
[`tma-devtools`](https://www.npmjs.com/package/tma-devtools) and
[`@tmakit/testing`](https://www.npmjs.com/package/@tmakit/testing).

Part of [tmakit](https://github.com/jw-mans/tmakit). Pure TypeScript, no React,
tree-shakeable. Reach for this directly only when building your own tooling — most apps
use `tma-devtools` / `@tmakit/testing` instead.

## Install

```bash
npm i @tmakit/core
```

## What it does

The bridge is **injected** (never imported), so a single mock works for an app built on
any SDK sharing the Telegram protocol:

```ts
import { mockTelegramEnv, emitEvent } from '@telegram-apps/bridge'; // or @tma.js/bridge
import { createMock } from '@tmakit/core';

const mock = createMock({
  bridge: { mockTelegramEnv, emitEvent },
  defaults: { platform: 'ios', version: '8.0' },
});

mock.logger.subscribe((entries) => { /* live "network tab" for the bridge */ });
mock.emit('theme_changed', { theme_params: {} });        // push an event into the app
mock.requests.pending();                                  // stateful async flows to resolve
```

`createMock` handles:

- **Interception + logging** of every outgoing `postEvent` (normalizing the differing
  `onEvent` signatures of `@telegram-apps/bridge` and `@tma.js/bridge`).
- **Auto-responses** to instant request events (`request_theme` → `theme_changed`, etc.).
- **Pending requests** for stateful flows (popup, invoice, QR, clipboard, biometry) via a
  `RequestManager`.
- **In-memory CloudStorage** simulation, so storage works end-to-end in dev.

## Also exported

- `isMethodSupported(method, version)` + `compareVersions` + `METHOD_MIN_VERSION` — the
  changelog-sourced version map used for feature-gating.
- Protocol types: `BridgeCall`, `BridgeLogEntry`, `MockLaunchParams`, `BridgePort`, …

## License

MIT
