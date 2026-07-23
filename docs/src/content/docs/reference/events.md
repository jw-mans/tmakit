---
title: Bridge events
description: Commonly used bridge methods and events, and the pairs the mock auto-answers.
---

:::note
Names and availability are version-dependent. This is an orientation list — verify against
your SDK sources and the [Telegram changelog](https://core.telegram.org/bots/webapps)
before relying on any single name.
:::

## App → Client (`postEvent` methods)

`web_app_ready`, `web_app_expand`, `web_app_close`,
`web_app_request_viewport`, `web_app_request_theme`,
`web_app_request_safe_area`, `web_app_request_content_safe_area`,
`web_app_setup_main_button`, `web_app_setup_secondary_button`,
`web_app_setup_back_button`, `web_app_setup_settings_button`,
`web_app_setup_closing_behavior`, `web_app_setup_swipe_behavior`,
`web_app_set_header_color`, `web_app_set_background_color`, `web_app_set_bottom_bar_color`,
`web_app_trigger_haptic_feedback`,
`web_app_open_popup`, `web_app_open_invoice`,
`web_app_open_scan_qr_popup`, `web_app_close_scan_qr_popup`,
`web_app_read_text_from_clipboard`, `web_app_request_write_access`, `web_app_request_phone`,
`web_app_open_link`, `web_app_open_tg_link`, `web_app_send_data`,
`web_app_invoke_custom_method`,
`web_app_biometry_request_access`, `web_app_biometry_request_auth`,
`web_app_biometry_open_settings`, `web_app_biometry_get_info`,
`web_app_request_fullscreen`, `web_app_exit_fullscreen`,
`web_app_start_accelerometer`, `web_app_start_gyroscope`, `web_app_start_device_orientation`,
`web_app_add_to_home_screen`, `web_app_check_home_screen`,
`web_app_request_location`, `web_app_open_location_settings`, `web_app_share_to_story`.

## Client → App (`emitEvent` events)

`viewport_changed`, `theme_changed`,
`safe_area_changed`, `content_safe_area_changed`,
`main_button_pressed`, `secondary_button_pressed`,
`back_button_pressed`, `settings_button_pressed`,
`popup_closed`, `invoice_closed`,
`qr_text_received`, `scan_qr_popup_closed`, `clipboard_text_received`,
`write_access_requested`, `phone_requested`, `custom_method_invoked`,
`biometry_info_received`, `biometry_auth_requested`, `biometry_token_updated`,
`fullscreen_changed`, `fullscreen_failed`,
`accelerometer_changed`, `gyroscope_changed`, `device_orientation_changed`,
`home_screen_added`, `home_screen_checked`,
`location_checked`, `location_requested`,
`visibility_changed`, `reload_iframe`.

## Auto-answered by the mock

Instant, stateless requests the mock answers immediately so the app never hangs:

| Request | Response |
|---|---|
| `web_app_request_theme` | `theme_changed` |
| `web_app_request_viewport` | `viewport_changed` |
| `web_app_request_safe_area` | `safe_area_changed` |
| `web_app_request_content_safe_area` | `content_safe_area_changed` |
| `web_app_biometry_get_info` | `biometry_info_received` |

Stateful flows (popup, invoice, QR, clipboard, biometry access/auth) are **not**
auto-answered — they become pending requests you resolve in the panel's Async tab or in a
test.
