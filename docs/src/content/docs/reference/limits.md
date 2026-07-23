---
title: Limits
description: CloudStorage, sendData, start_param and initData limits to design around.
---

:::note
Values can change — verify against the current
[Telegram docs](https://core.telegram.org/bots/webapps).
:::

## CloudStorage

| Limit | Value |
|---|---|
| Key length | ≤ 128 chars |
| Value length | ≤ 4096 chars |
| Number of keys | ≤ 1024 |
| Value type | strings only (serialize JSON yourself) |

`createTypedStore` handles serialization and enforces the key/value limits, throwing
`StorageLimitError` when exceeded. Exposed as `CLOUD_STORAGE_LIMITS`.

## `sendData`

- Payload up to ~4096 bytes.
- **Calling it closes the Mini App.**
- Works only for apps opened via a keyboard button.
- For larger or silent data, use a backend request instead of `sendData`.

## `start_param` / `startapp`

- Limited length and alphabet (typically `[A-Za-z0-9_-]`).
- Don't put raw JSON in it — encode it or use it as a key.

## initData

- Valid for a limited time — check `auth_date` on the server and reject stale data.
- Signed with HMAC-SHA256 derived from the bot token.
- **Validate only on the server** (see [Auth](/tmakit/guides/auth/)).
- Exchange it for a session once; don't send it on every request.
