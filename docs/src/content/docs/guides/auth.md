---
title: Auth (initData → session)
description: Validate initData on the server, issue a session token, and exchange it on the client.
---

`initData` is the signed payload Telegram gives your Mini App. **Validate it only on the
server** — the bot token is a secret and the client is not a trusted party. tmakit isolates
all of this in the `tma-kit/server` subpath (Node runtime), which client code never imports.

## Server: validate + issue a session

```ts
import express from 'express';
import { validateInitData, signSession, expressInitDataAuth } from 'tma-kit/server';

const app = express();
app.use(express.json());

app.post('/auth', (req, res) => {
  const result = validateInitData(req.body.initData, process.env.BOT_TOKEN!, {
    maxAgeSeconds: 3600, // reject stale initData
  });
  if (!result.ok) return res.status(401).json({ error: result.error });

  const token = signSession({ sub: String(result.data.user!.id) }, process.env.JWT_SECRET!, {
    expiresInSeconds: 3600,
  });
  res.json({ token });
});
```

`validateInitData` verifies the HMAC-SHA256 signature against the bot token and (optionally)
the `auth_date` freshness. `signSession` / `verifySession` are a minimal, dependency-free
HS256 implementation — swap in a full JWT library if you need audiences, rotation, etc.

### Or use the middleware

```ts
app.use('/api', expressInitDataAuth({ botToken: process.env.BOT_TOKEN!, maxAgeSeconds: 3600 }));
// on success, req.tmaInitData holds the parsed, verified data
```

Typed against minimal interfaces, so it works with Express without a hard dependency.

## Client: exchange once, then refresh

Don't send `initData` on every request — exchange it for a session token once:

```tsx
import { useInitDataAuth } from 'tma-kit';

const { token, status, refresh } = useInitDataAuth({
  endpoint: '/auth',
  initData, // raw initData from your SDK, e.g. retrieveRawInitData()
});
```

It POSTs the initData to your endpoint, stores the returned `token`, and exposes `refresh()`
for when it expires.

:::danger
Never call `validateInitData` in the browser — it needs the bot token. Keep the
`tma-kit/server` import server-side only.
:::
