---
title: Version map
description: The method → minimum Bot API version map used for feature-gating.
---

`@tmakit/core` keeps a single method → minimum-version map, used by
[`useSupports`](/tmakit/guides/feature-gating/) as a fallback when the SDK's own
`isSupported` isn't available. Unknown (ungated) methods are treated as supported.

:::caution
The source of truth is the [Telegram changelog](https://core.telegram.org/bots/webapps),
not memory. Keep this map in sync there.
:::

## Confirmed against the changelog

| Method | Min version |
|---|---|
| `web_app_set_header_color` | 6.1 |
| `web_app_open_popup` | 6.2 |
| `web_app_open_scan_qr_popup` | 6.4 |
| `web_app_read_text_from_clipboard` | 6.4 |
| `web_app_request_write_access` | 6.9 |
| `web_app_request_phone` | 6.9 |
| `web_app_setup_swipe_behavior` | 7.7 |
| `web_app_request_fullscreen` | 8.0 |
| `web_app_exit_fullscreen` | 8.0 |
| `web_app_add_to_home_screen` | 8.0 |
| `web_app_check_home_screen` | 8.0 |
| `web_app_start_accelerometer` | 8.0 |
| `web_app_start_gyroscope` | 8.0 |
| `web_app_start_device_orientation` | 8.0 |
| `web_app_request_location` | 8.0 |
| `web_app_open_location_settings` | 8.0 |

## Grouped from milestones — verify before relying

These are grouped from reference milestones but not individually re-verified against the
changelog. Confirm the exact version before gating on them.

| Method | Min version |
|---|---|
| `web_app_biometry_request_access` | 7.2 |
| `web_app_biometry_request_auth` | 7.2 |
| `web_app_biometry_get_info` | 7.2 |
| `web_app_biometry_open_settings` | 7.2 |
| `web_app_share_to_story` | 7.8 |
| `web_app_setup_secondary_button` | 7.10 |
| `web_app_set_bottom_bar_color` | 7.10 |

## API

```ts
import { isMethodSupported, compareVersions, METHOD_MIN_VERSION } from '@tmakit/core';

isMethodSupported('web_app_open_popup', '6.1'); // false
compareVersions('7.10', '7.2'); // 1 (numeric, not lexicographic)
```
