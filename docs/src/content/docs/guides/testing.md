---
title: Testing
description: Unit-test components with a bridge double, and run mock-driven Playwright E2E.
---

`@tmakit/testing` provides two utilities on the same [mock engine](/tmakit/concepts/mock-engine/):
a bridge double for unit tests and a driver for Playwright.

## Unit tests — `createMockBridge`

Wire the double into `TmaProvider`, render a component, and drive events via `mock`:

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { TmaProvider, usePayment } from 'tma-kit';
import { createMockBridge } from '@tmakit/testing';

test('resolves an invoice as paid', async () => {
  const { bridge, mock } = createMockBridge({ version: '8.0' });
  const wrapper = ({ children }) => <TmaProvider bridge={bridge}>{children}</TmaProvider>;

  const { result } = renderHook(() => usePayment(), { wrapper });
  act(() => { result.current.open('slug'); });

  await waitFor(() => expect(mock.requests.pending().length).toBe(1));
  const { id } = mock.requests.pending()[0];
  act(() => mock.requests.resolve(id, { name: 'invoice_closed', params: { slug: 'slug', status: 'paid' } }));

  await waitFor(() => expect(result.current.status).toBe('paid'));
});
```

`createMockBridge` returns `{ bridge, mock }` — the bridge for the provider, the
`MockController` to drive events, inspect the log, and resolve requests.

## E2E — `createTmaPageDriver`

In dev, expose the mock on `window`:

```ts
import { MOCK_GLOBAL_KEY } from '@tmakit/testing';
if (import.meta.env.DEV) (window as any)[MOCK_GLOBAL_KEY] = mock;
```

Then drive it from a Playwright test:

```ts
import { test, expect } from '@playwright/test';
import { createTmaPageDriver } from '@tmakit/testing';

test('payment flow', async ({ page }) => {
  await page.goto('/');
  const tma = createTmaPageDriver(page);

  await tma.emit('main_button_pressed');            // press the native button
  const [invoice] = await tma.pending();            // app opened an invoice
  await tma.resolveRequest(invoice.id, {
    name: 'invoice_closed',
    params: { slug: 'demo', status: 'paid' },
  });
  await expect(page.getByTestId('payment')).toHaveText('paid');
});
```

The driver (`emit`, `log`, `pending`, `resolveRequest`) controls the in-page mock via
`page.evaluate`, so E2E runs in a real browser with no real Telegram. It's typed against a
minimal `PageLike`, so there's no hard dependency on `@playwright/test`.
