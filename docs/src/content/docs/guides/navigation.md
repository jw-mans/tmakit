---
title: Navigation
description: Declarative Main/Secondary/Back buttons and router integration.
---

Telegram's Main, Secondary and Back buttons are native and global — easy to leave in a
stale state when you navigate. tmakit exposes them as **declarative, headless components**
that follow your render tree.

## Declarative buttons

```tsx
import { MainButton, SecondaryButton, BackButton } from 'tma-kit';

function EditScreen({ valid, onSave, onCancel, canGoBack, goBack }) {
  return (
    <>
      {canGoBack && <BackButton onClick={goBack} />}
      <SecondaryButton text="Cancel" onClick={onCancel} position="left" />
      <MainButton text="Save" onClick={onSave} disabled={!valid} />
      {/* your screen */}
    </>
  );
}
```

Each renders nothing. On mount/update it sets the native button up; on unmount it hides it.
Setup and hide are separate effects, so re-rendering with new props doesn't flicker.

`MainButton` / `SecondaryButton` props: `text`, `color?`, `textColor?`, `disabled?`,
`progress?`, `onClick?` (plus `position?` for the secondary). `BackButton` props: `onClick?`,
`visible?`.

## Router integration

Tie the native (and Android hardware) back button to your router:

```tsx
import { useBackButtonRouter } from 'tma-kit';

useBackButtonRouter({
  canGoBack: history.length > 1,
  onBack: () => navigate(-1),
});
```

It shows the back button while `canGoBack` and calls `onBack` on `back_button_pressed`,
which the client also maps to Android's hardware back.

## Drive it in dev

The buttons are native, so there's nothing to click in your DOM. Open the panel's
**Buttons tab** to see their current state and fire their presses.
