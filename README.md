# tmakit

SDK-agnostic devtools and runtime kit for **Telegram Mini Apps**.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-starlight-1a1a1a.svg)](https://jw-mans.github.io/tmakit/)
![Types](https://img.shields.io/badge/types-included-3178c6.svg)

Not a wrapper over an SDK — the value is in the layers _around_ it: a rich dev-time
client mock, opinionated runtime helpers the SDK deliberately leaves out, and testing
utilities. Works with both `@telegram-apps/*` and `@tma.js/*`.

## Why tmakit?

The SDK gets you a bridge. Everything after that you build yourself — and it's the same
boilerplate in every Mini App:

- Your app **crashes outside Telegram** — no launch params, nothing to talk to.
- You **can't emulate a user** or see what the app sends the client.
- `initData` validation is **hand-rolled HMAC**, easy to get subtly wrong.
- The **viewport jumps** on expand; safe-area insets are your problem.
- CloudStorage is **stringly-typed** with silent limits.
- Methods **break on old clients** — and you hear it from a user, not a type error.
- You **can't write a test** without a real Telegram client.

tmakit ships those missing layers, and keeps them honest:

- 🧪 **A real client mock** you drive from a panel — users, themes, viewport, async flows
  (popup/invoice/QR/biometry), platform & version — **stripped from production**.
- 🪝 **Runtime hooks** for viewport/safe-area, storage, payments, navigation, feature-gating.
- 🔐 **Server-side `initData` auth** isolated in `tma-kit/server` — the bot token never
  touches the client.
- ✅ **Testing built-in** — the same mock engine powers Vitest unit tests and Playwright E2E.
- 🔌 **SDK-agnostic** — inject your bridge; works with `@telegram-apps/*` or `@tma.js/*`.
- 📦 **Tree-shakeable**, fully typed, zero runtime deps in the core.

Not a re-export of the SDK — the layers around it, the ones you'd otherwise write by hand.

## Packages

| Package                                | Kind           | What it is                                                                                                                                |
| -------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [`tma-kit`](packages/kit)             | runtime (prod) | Hooks & helpers: auth, viewport/safe-area, storage, payments, navigation, feature-gating. Plus`tma-kit/server` for initData validation. |
| [`tma-devtools`](packages/devtools)   | dev-only       | Floating panel + Telegram client mock: bridge log, user/theme/viewport editors, async-flow resolvers, platform/version switcher.          |
| [`@tmakit/core`](packages/core)       | shared         | The SDK-agnostic mock engine and bridge-protocol types both of the above build on.                                                        |
| [`@tmakit/testing`](packages/testing) | dev-only       | Unit-test bridge double (Vitest) and a Playwright driver, on the same mock engine.                                                        |

## Core principles

- **Dev and runtime never share a bundle.** The mock (`tma-devtools`) is dev-only and
  tree-shaken out of production behind `import.meta.env.DEV`.
- **SDK-agnostic.** The bridge is injected, never imported — bring your own
  (`@telegram-apps/bridge` or `@tma.js/bridge`).
- **initData is validated only on the server** (`tma-kit/server`), never on the client.
- **Feature-gate via `isSupported`, not by comparing versions in your head.**
- **Everything tree-shakeable.** Mini Apps load over mobile networks — every KB shows.

## Quick start

```bash
npm i tma-kit @telegram-apps/bridge react
npm i -D tma-devtools
```

```tsx
// set up the mock in dev, then wrap your app
import { on, postEvent } from '@telegram-apps/bridge';
import { TmaProvider, useViewport } from 'tma-kit';

function Screen() {
  const viewport = useViewport(); // stable height, mirrored into CSS vars
  return <div style={{ height: 'var(--tg-viewport-stable-height)' }}>{viewport.height}px</div>;
}

export default function App() {
  return (
    <TmaProvider bridge={{ on, postEvent }}>
      <Screen />
    </TmaProvider>
  );
}
```

See each package's README for details.

## Development

```bash
npm install          # install workspaces
npm run dev          # playground (Vite) with the devtools panel mounted
npm run typecheck    # all packages
npm test             # Vitest unit tests
npm run build        # build all packages (JS via Vite + .d.ts via tsc)
npm run test:e2e     # Playwright (first: npx playwright install chromium)
```

## License

MIT
