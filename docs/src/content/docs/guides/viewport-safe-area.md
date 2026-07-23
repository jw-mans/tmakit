---
title: Viewport & safe area
description: Stable viewport height and safe-area insets, as state and CSS variables.
---

Two hooks track the client's layout and mirror it into CSS variables, so content stops
jumping on expand and respects notches/rounded corners.

## `useViewport`

```tsx
import { useViewport } from 'tma-kit';

function Screen() {
  const { height, width, isExpanded, isStable } = useViewport();
  return <main style={{ minHeight: 'var(--tg-viewport-stable-height)' }}>…</main>;
}
```

On mount it requests the viewport (if the bridge can `postEvent`) and then listens for
`viewport_changed`. It sets these CSS vars on `:root`:

- `--tg-viewport-height` — current height.
- `--tg-viewport-stable-height` — updated **only when the height is stable**, so layouts
  pinned to it don't jump mid-animation.
- `--tg-viewport-width`.

## `useSafeArea`

```tsx
import { useSafeArea } from 'tma-kit';

const { safeArea, contentSafeArea } = useSafeArea();
// insets: { top, right, bottom, left }
```

Sets `--tg-safe-area-inset-{top,right,bottom,left}` and
`--tg-content-safe-area-inset-{top,right,bottom,left}`. Use them in CSS:

```css
.page {
  padding-top: var(--tg-safe-area-inset-top);
  padding-bottom: var(--tg-safe-area-inset-bottom);
}
```

## Options

Both hooks accept `{ requestOnMount?: boolean; target?: StyleTarget }`. Pass a `target` to
write the vars somewhere other than the document root (useful in tests).

## Drive it in dev

Open the panel's **Viewport tab** and drag the sliders / edit the insets — the hook state
and CSS vars update live.
