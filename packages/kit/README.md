# tma-kit

Opinionated **runtime** helpers for Telegram Mini Apps — the layers the SDK leaves out:
auth, viewport/safe-area, storage, payments, navigation and feature-gating. Ships to
production, fully tree-shakeable.

Part of [tmakit](https://github.com/jw-mans/tmakit). SDK-agnostic: you inject the bridge,
so it works with `@telegram-apps/bridge` or `@tma.js/bridge`.

## Why tma-kit?

The SDK gives you a bridge and stops there. `tma-kit` covers the parts you'd otherwise
re-implement in every Mini App — the parts that are easy to get subtly wrong:

- 🖼️ **Viewport that doesn't jump.** `useViewport` / `useSafeArea` wait for stable values
  and mirror them into CSS variables.
- 💾 **Typed CloudStorage** with a localStorage fallback and schema validation —
  no stringly-typed keys, no silent limit overruns.
- 💳 **Payments as a promise.** `usePayment().open(slug)` resolves with the invoice status.
- 🧭 **Declarative native buttons.** `<MainButton>` / `<BackButton>` follow your render
  tree instead of drifting between screens.
- 🚦 **Feature-gating done right.** `useSupports('...')` instead of comparing version
  numbers by hand.
- 🔐 **Auth the safe way.** `tma-kit/server` validates `initData` where the bot token
  lives; the client just exchanges it for a session.

All tree-shakeable, fully typed, and driven live by the [`tma-devtools`](https://www.npmjs.com/package/tma-devtools)
panel while you build.

## Install

```bash
npm i tma-kit react
npm i @telegram-apps/bridge   # or @tma.js/bridge
```

`react` (>=18) and a bridge are peer dependencies.

## Setup

Wrap your app in `TmaProvider`, giving it the bridge functions from your SDK:

```tsx
import { on, postEvent, isSupported } from '@telegram-apps/bridge';
import { TmaProvider } from 'tma-kit';

<TmaProvider bridge={{ on, postEvent, isSupported, version: '8.0' }}>
  <App />
</TmaProvider>;
```

Only `on` is required; `postEvent`, `isSupported` and `version` unlock more behavior.

## Hooks

### Layout — `useViewport`, `useSafeArea`

Wait for the client's real values and mirror them into CSS variables, so content stops
jumping on expand.

```tsx
const { height, isExpanded, isStable } = useViewport();
const { safeArea, contentSafeArea } = useSafeArea();
// CSS vars set on :root:
//   --tg-viewport-height / --tg-viewport-stable-height / --tg-viewport-width
//   --tg-safe-area-inset-{top,right,bottom,left}
//   --tg-content-safe-area-inset-{top,right,bottom,left}
```

### Feature-gating — `useSupports`

```tsx
const canFullscreen = useSupports('web_app_request_fullscreen');
```

Prefers the SDK's own `isSupported`, falls back to a changelog-sourced version map — never
compare version numbers by hand.

### Storage — `useStoredState`

Typed persistence over Telegram CloudStorage, with a localStorage fallback and optional
schema validation (any `{ parse }` — zod schemas qualify).

```tsx
const { value, setValue, loading } = useStoredState<Prefs>('prefs', {
  initial: defaults,
  schema: prefsSchema, // optional
});
```

Low-level building blocks are exported too: `createCloudStorageAdapter`,
`createLocalStorageAdapter`, `resolveStorageAdapter`, `createTypedStore`.

### Payments — `usePayment`

```tsx
const payment = usePayment();
const status = await payment.open('invoice-slug'); // 'paid' | 'cancelled' | 'failed' | 'pending'
```

### Navigation — declarative buttons

Headless components that set up the native buttons on render and hide them on unmount, so
buttons follow your render tree instead of drifting between screens.

```tsx
{canGoBack && <BackButton onClick={goBack} />}
<MainButton text="Continue" onClick={submit} disabled={!valid} />

// or wire the native/hardware back button to your router:
useBackButtonRouter({ canGoBack, onBack: goBack });
```

## Auth — `tma-kit/server`

initData validation runs **only on the server** (the bot token is a secret). Import from
the `tma-kit/server` subpath (Node runtime):

```ts
import { validateInitData, signSession, expressInitDataAuth } from 'tma-kit/server';

app.post('/auth', (req, res) => {
  const result = validateInitData(req.body.initData, process.env.BOT_TOKEN!, { maxAgeSeconds: 3600 });
  if (!result.ok) return res.status(401).json({ error: result.error });
  const token = signSession({ sub: String(result.data.user!.id) }, process.env.JWT_SECRET!, {
    expiresInSeconds: 3600,
  });
  res.json({ token });
});

// or drop-in middleware: app.use(expressInitDataAuth({ botToken, maxAgeSeconds: 3600 }))
```

Client side, exchange initData for a session once and refresh:

```tsx
const { token, status, refresh } = useInitDataAuth({ endpoint: '/auth', initData });
```

## License

MIT
