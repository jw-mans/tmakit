---
title: Payments
description: Open a Stars invoice and resolve it by slug with usePayment.
---

`usePayment` wraps `open_invoice` / `invoice_closed` into a small state machine, correlating
the result by slug so concurrent invoices don't cross wires.

## `usePayment`

```tsx
import { usePayment } from 'tma-kit';

function BuyButton() {
  const payment = usePayment();

  const buy = async () => {
    const status = await payment.open('invoice-slug');
    // status: 'paid' | 'cancelled' | 'failed' | 'pending'
    if (status === 'paid') unlockFeature();
  };

  return <button onClick={buy} disabled={payment.status === 'opening'}>Buy</button>;
}
```

`payment.status` moves through `idle → opening → <terminal>`. `payment.slug` holds the
active slug; `payment.reset()` clears it.

## Pure helper

For non-React use, the underlying promise helper is exported:

```ts
import { openInvoice } from 'tma-kit';

const status = await openInvoice(bridge, 'invoice-slug', { timeoutMs: 30_000 });
```

## Drive it in dev

Calling `open(...)` sends `open_invoice`, which the mock surfaces as a **pending request**
(it can't guess the outcome). In the panel's **Async tab**, resolve it as paid / pending /
cancelled / failed — the promise resolves with that status.

:::note
This operates at the bridge level with a `slug`. Wiring the slug to an actual Telegram
Stars invoice (or TON Connect) is your backend's job; tmakit handles the client round-trip.
:::
