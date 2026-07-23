---
title: Getting started
description: Install tmakit, set up the mock in dev, and wrap your app.
---

## Install

```bash
npm i tma-kit @telegram-apps/bridge react
npm i -D tma-devtools
```

`react` (>=18) and a bridge (`@telegram-apps/bridge` or `@tma.js/bridge`) are peer
dependencies of `tma-kit`.

## 1. Set up the mock (dev only)

Create a module that installs the Telegram client mock **before** the SDK reads the
environment, and import it first in your entry point.

```ts
// src/tma-mock.ts
import { mockTelegramEnv, emitEvent } from '@telegram-apps/bridge';
import { createMock } from '@tmakit/core';

export const mock = createMock({
  bridge: { mockTelegramEnv, emitEvent },
  defaults: { platform: 'tdesktop', version: '8.0' },
});
```

:::caution
This is dev-only scaffolding. In a real app, guard the whole mock setup behind
`import.meta.env.DEV` so it never ships to production.
:::

## 2. Provide the bridge and mount the panel

```tsx
// src/main.tsx
import './tma-mock.ts'; // must be first
import { createRoot } from 'react-dom/client';
import { on, postEvent } from '@telegram-apps/bridge';
import { TmaProvider } from 'tma-kit';
import { DevtoolsPanel } from 'tma-devtools';
import { mock } from './tma-mock';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <TmaProvider bridge={{ on, postEvent, version: '8.0' }}>
    <App />
    {import.meta.env.DEV && <DevtoolsPanel controller={mock} />}
  </TmaProvider>,
);
```

## 3. Use a hook

```tsx
import { useViewport } from 'tma-kit';

function Screen() {
  const viewport = useViewport(); // waits for the client, mirrors CSS vars
  return <div style={{ minHeight: 'var(--tg-viewport-stable-height)' }}>{viewport.height}px</div>;
}
```

Run your dev server — the app boots outside Telegram, the panel appears bottom-right, and
you can drive the viewport, switch themes, edit the user, and resolve async flows.

## Next

- [The devtools panel](/tmakit/guides/devtools-panel/) — what each tab does.
- [Tutorial](/tmakit/start/tutorial/) — build a small screen end to end.
