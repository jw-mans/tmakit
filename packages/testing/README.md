# @tmakit/testing

**Dev-only** test utilities for Telegram Mini Apps, on the same mock engine as the
devtools panel: a bridge double for unit tests and a Playwright driver for E2E.

Part of [tmakit](https://github.com/jw-mans/tmakit).

## Install

```bash
npm i -D @tmakit/testing
```

`tma-kit` is a peer dependency.

## Unit tests — `createMockBridge`

A bridge test double backed by `@tmakit/core`. Wire it into `TmaProvider` to render
components that use `tma-kit` hooks, and drive events / inspect traffic via `mock`.

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { TmaProvider, usePayment } from 'tma-kit';
import { createMockBridge } from '@tmakit/testing';

const { bridge, mock } = createMockBridge({ version: '8.0' });
const wrapper = ({ children }) => <TmaProvider bridge={bridge}>{children}</TmaProvider>;

const { result } = renderHook(() => usePayment(), { wrapper });
act(() => { result.current.open('slug'); });
const { id } = (await mock.requests.pending())[0] ?? {};
act(() => mock.requests.resolve(id, { name: 'invoice_closed', params: { slug: 'slug', status: 'paid' } }));
await waitFor(() => expect(result.current.status).toBe('paid'));
```

## E2E — `createTmaPageDriver`

The mock runs inside the page (your app exposes its `MockController` on
`window.__tmakit_mock__` in dev). The driver controls it from a Playwright test via
`page.evaluate`, so E2E answers postEvents and injects events without a real client.

```ts
import { createTmaPageDriver } from '@tmakit/testing';

const tma = createTmaPageDriver(page);
await tma.emit('viewport_changed', { height: 500, width: 360, is_expanded: true, is_state_stable: true });

const [invoice] = await tma.pending();
await tma.resolveRequest(invoice.id, { name: 'invoice_closed', params: { slug: 's', status: 'paid' } });

const log = await tma.log(); // the bridge log, as seen in-page
```

Expose the mock in your dev entry:

```ts
import { MOCK_GLOBAL_KEY } from '@tmakit/testing';
if (import.meta.env.DEV) (window as any)[MOCK_GLOBAL_KEY] = mock;
```

Typed against a minimal `PageLike` — no hard dependency on `@playwright/test`.

## License

MIT
