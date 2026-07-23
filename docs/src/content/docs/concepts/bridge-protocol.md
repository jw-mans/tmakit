---
title: The bridge protocol
description: How a Mini App talks to the Telegram client, and why that seam is where tmakit plugs in.
---

Every Telegram Mini App SDK talks to the client through one small protocol. Understanding
it explains how the mock works and why it's SDK-agnostic.

## Two directions

- **App → Client** — the app calls `postEvent(method, params)`. Internally this routes to
  `window.TelegramWebviewProxy.postEvent`, `window.parent.postMessage`, or
  `window.external.notify`, depending on the platform. Method names look like
  `web_app_request_viewport`, `web_app_open_invoice`, `web_app_setup_main_button`.
- **Client → App** — the client dispatches events the app subscribes to via `on(event,
  listener)`. Event names look like `viewport_changed`, `invoice_closed`,
  `main_button_pressed`.

## Request / response pairs

Some calls are effectively requests that expect a matching event back. If nothing answers,
the app hangs:

| App sends (`postEvent`) | Client replies (event) |
|---|---|
| `web_app_request_theme` | `theme_changed` |
| `web_app_request_viewport` | `viewport_changed` |
| `web_app_request_safe_area` | `safe_area_changed` |
| `web_app_open_popup` | `popup_closed` |
| `web_app_open_invoice` | `invoice_closed` |

Some flows correlate by an id (`req_id`) — clipboard reads, custom methods (CloudStorage),
so responses must echo the same `req_id`.

## Why this is the seam

Because there's exactly one protocol, tmakit's mock plugs in at this seam: it intercepts
outgoing `postEvent` calls (the "network tab" for the bridge), auto-answers the instant
requests, and emits events back into the app. It doesn't need to know which SDK you use —
both SDKs speak this same protocol.

See the full lists in the [Bridge events reference](/tmakit/reference/events/).

:::note
Event and method names are version-dependent. Don't hardcode them from memory — verify
against the [Telegram changelog](https://core.telegram.org/bots/webapps) and your SDK.
:::
