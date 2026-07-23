# tma-devtools

**Dev-only** interactive panel and a rich Telegram client mock for Telegram Mini Apps.
Emulate the user, drive the client, visualize the surface, watch the bridge, and resolve
async flows — all without a real Telegram.

Part of [tmakit](https://github.com/jw-mans/tmakit).

> **HARD RULE:** keep this in `devDependencies` and mount only behind
> `import.meta.env.DEV`. The mock is both dead weight and a security hole in production —
> it must never ship. When gated correctly, bundlers tree-shake it out entirely.

## Install

```bash
npm i -D tma-devtools
npm i @telegram-apps/bridge   # or @tma.js/bridge (peer)
```

`react` / `react-dom` (>=18) are peer dependencies.

## Usage

Set the mock up **before** your SDK initializes, then mount the panel behind the dev flag:

```tsx
// tma-mock.ts — imported first, at the top of your entry
import { mockTelegramEnv, emitEvent } from '@telegram-apps/bridge';
import { createMock } from '@tmakit/core';

export const mock = createMock({
  bridge: { mockTelegramEnv, emitEvent },
  defaults: { platform: 'tdesktop', version: '8.0' },
});
```

```tsx
import { DevtoolsPanel } from 'tma-devtools';
import { mock } from './tma-mock';

{import.meta.env.DEV && <DevtoolsPanel controller={mock} />}
```

## The panel

- **log** — every `postEvent` in both directions, timestamped, with payloads and a filter.
- **user** — edit initData (name, username, `language_code`, premium, `start_param`) with
  premium / referral / RTL presets.
- **theme** — switch light/dark, emitting `theme_changed` live.
- **viewport** — height/width sliders, expanded/fullscreen toggles, safe-area inset editors.
- **buttons** — visualize Main/Back/Secondary/Settings buttons and fire their presses; haptic indicator.
- **async** — resolve pending popup / invoice / QR / clipboard / biometry requests.
- **platform** — switch platform and client version, with a live feature-degradation preview.

The mock engine itself lives in [`@tmakit/core`](https://github.com/jw-mans/tmakit/tree/main/packages/core);
this package is the UI on top of a `MockController`.

## License

MIT
