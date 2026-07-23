---
title: 'Tutorial: build a Mini App screen'
description: Build a small checkout screen with tmakit — viewport, a main button, a payment, and persisted state — driven entirely by the mock.
---

By the end you'll have a screen that reacts to the viewport, shows a native main button,
takes a (fake) payment, and remembers a value across reloads — all without opening
Telegram. It assumes you've done [Getting started](/tmakit/start/getting-started/).

## The screen

```tsx
// src/Checkout.tsx
import { MainButton, useStoredState, usePayment, useViewport } from 'tma-kit';

export function Checkout() {
  const viewport = useViewport();
  const payment = usePayment();
  const { value: gift, setValue: setGift } = useStoredState<boolean>('gift-wrap', {
    initial: false,
  });

  const status = payment.status; // 'idle' | 'opening' | 'paid' | 'cancelled' | 'failed' | 'pending'

  return (
    <main style={{ minHeight: 'var(--tg-viewport-stable-height)', padding: 16 }}>
      <h1>Checkout</h1>
      <p>viewport: {viewport.width}×{viewport.height}</p>

      <label>
        <input type="checkbox" checked={!!gift} onChange={(e) => setGift(e.target.checked)} />
        Gift wrap (remembered across reloads)
      </label>

      <p>payment: {status}</p>

      {status !== 'paid' && (
        <MainButton
          text="Pay 100 ⭐"
          progress={status === 'opening'}
          onClick={() => payment.open('demo-invoice')}
        />
      )}
    </main>
  );
}
```

There's no visible "Pay" button in your DOM — `<MainButton>` is Telegram's **native**
button. It's headless: rendering it sets the button up; unmounting hides it.

## Drive it from the panel

Run the dev server and open the devtools panel (bottom-right).

1. **Viewport tab** — drag the height slider. The `viewport: …` line updates live, because
   `useViewport` is listening to the `viewport_changed` events the panel emits.
2. **Buttons tab** — you'll see **MainButton** with text `Pay 100 ⭐`. Click **press**.
   That fires `main_button_pressed`, which runs your `onClick` → `payment.open(...)`.
3. **Async tab** — a pending **invoice** appears (the app called `open_invoice`, which the
   mock surfaces instead of auto-answering). Click **paid**. `payment.status` flips to
   `paid` and the main button disappears.
4. Toggle **Gift wrap**, then reload the page. The checkbox stays checked — it persisted
   through CloudStorage (simulated in-memory by the mock).

## What just happened

You exercised four runtime helpers and never touched a real Telegram client:

- `useViewport` mirrored the client viewport into state and CSS vars.
- `<MainButton>` declaratively drove the native button.
- `usePayment` opened an invoice and resolved it by slug.
- `useStoredState` persisted typed state over CloudStorage.

Each is covered in depth under **Guides**. To understand _how_ the mock answered all this,
read [The mock engine](/tmakit/concepts/mock-engine/).
