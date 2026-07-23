---
title: Storage
description: Typed persistence over Telegram CloudStorage, with a localStorage fallback.
---

`tma-kit` wraps CloudStorage in a uniform async adapter, adds a localStorage fallback, and
layers a typed store with optional schema validation on top.

## `useStoredState`

The ergonomic entry point:

```tsx
import { useStoredState } from 'tma-kit';

const { value, setValue, remove, loading, error } = useStoredState<Prefs>('prefs', {
  initial: defaults,
  schema: prefsSchema, // optional; any { parse } — zod schemas qualify
});
```

It resolves the right adapter (CloudStorage when supported, else localStorage), serializes
JSON, validates on read, and loads on mount.

## Schema validation without a zod dependency

The `schema` option is any object with a `parse(input): T` method that throws on invalid
input. A zod schema satisfies this as-is — but zod is **not** a dependency, so you only pay
for it if you use it.

## Limits

CloudStorage stores strings only, with hard limits (keys ≤ 128 chars, values ≤ 4096 chars,
≤ 1024 keys). The typed store enforces the key and value limits and throws
`StorageLimitError` if exceeded. See the [Limits reference](/tmakit/reference/limits/).

## Low-level building blocks

For non-React use or custom wiring:

```ts
import {
  createCloudStorageAdapter, // over the bridge (invoke_custom_method + req_id)
  createLocalStorageAdapter, // fallback; inject a backend for tests
  resolveStorageAdapter,     // pick cloud when supported, else local
  createTypedStore,          // JSON + schema + limits over any adapter
} from 'tma-kit';
```

## Drive it in dev

The mock simulates CloudStorage in-memory, so `useStoredState` works end-to-end offline —
set a value, reload, and it's still there.
