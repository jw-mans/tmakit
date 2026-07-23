---
title: Feature-gating
description: Check method support instead of comparing client versions by hand.
---

Telegram clients fragment by platform and version — a method available on 8.0 may be
missing on 7.2. Never branch on version numbers inline. Ask whether a method is supported.

## `useSupports`

```tsx
import { useSupports } from 'tma-kit';

function ShareButton() {
  const canShare = useSupports('web_app_share_to_story');
  if (!canShare) return null; // graceful degradation
  return <button onClick={share}>Share to story</button>;
}
```

`useSupports` prefers the SDK's own `isSupported` (most accurate), falls back to a
changelog-sourced version map when only `version` is known, and is optimistic (`true`)
otherwise. Provide `isSupported` and/or `version` on the `TmaProvider` bridge to enable it.

## The version map

The method → minimum-version map lives in one module (`@tmakit/core`) so it can be kept in
sync with the [Telegram changelog](https://core.telegram.org/bots/webapps) rather than
scattered through your code. It's exported for direct use:

```ts
import { isMethodSupported, compareVersions, METHOD_MIN_VERSION } from '@tmakit/core';

isMethodSupported('web_app_request_fullscreen', '7.7'); // false — needs 8.0
compareVersions('7.10', '7.2'); // 1 — numeric, not lexicographic
```

See the [Version map reference](/tmakit/reference/version-map/).

## Drive it in dev

The panel's **Platform tab** switches the reported version and shows a live table of which
methods degrade — so you can walk your UI down to an old client without a device.
