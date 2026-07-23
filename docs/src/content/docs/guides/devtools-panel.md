---
title: The devtools panel
description: Set up the mock, mount the panel, and use each tab.
---

`tma-devtools` is a floating panel over the [mock engine](/tmakit/concepts/mock-engine/).
Keep it in `devDependencies` and mount it only behind `import.meta.env.DEV`.

## Setup

```ts
// tma-mock.ts — imported first in your entry
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

## The tabs

- **log** — every `postEvent` in both directions (`→` app→client, `←` client→app), with
  timestamps, payloads, and a direction filter.
- **user** — edit `initData` (name, username, `language_code`, premium, `start_param`) with
  premium / referral / RTL presets. Applying reloads the page so the SDK re-parses.
- **theme** — switch light/dark, emitting `theme_changed` live.
- **viewport** — height/width sliders, expanded/fullscreen toggles, and safe-area /
  content-safe-area inset editors.
- **buttons** — visualize Main/Secondary/Back/Settings buttons (read from the log) and
  fire their presses; a haptic indicator flashes on `trigger_haptic_feedback`.
- **async** — resolve pending popup / invoice / QR / clipboard / biometry requests. A badge
  shows the pending count.
- **platform** — switch platform and client version, with a live preview of which methods
  degrade at the chosen version.

## It's stripped from production

The panel and mock only load in dev. Mount it behind `import.meta.env.DEV` and, in a
production build, the bundler tree-shakes all of it out — verify with a quick grep of your
built bundle for a panel-only string like `Open tmakit devtools`.
