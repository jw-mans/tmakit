/**
 * Method → minimum Bot API version.
 *
 * SOURCE OF TRUTH IS THE CHANGELOG, NOT MEMORY. This list is intentionally a
 * single, separate module so it can be kept in sync with
 * https://core.telegram.org/bots/webapps (changelog). NEVER gate by comparing
 * versions inline elsewhere — always go through {@link isMethodSupported}, and at
 * runtime prefer the SDK's own `isSupported`/`supports` when available.
 *
 * Unknown methods are treated as supported (they predate gating). Add entries here,
 * with the version confirmed against the changelog, rather than scattering checks.
 */

// Confirmed against core.telegram.org/bots/webapps (2026-07):
const CONFIRMED: Record<string, string> = {
  web_app_set_header_color: '6.1',
  web_app_open_popup: '6.2',
  web_app_open_scan_qr_popup: '6.4',
  web_app_read_text_from_clipboard: '6.4',
  web_app_request_write_access: '6.9',
  web_app_request_phone: '6.9',
  web_app_setup_swipe_behavior: '7.7',
  web_app_request_fullscreen: '8.0',
  web_app_exit_fullscreen: '8.0',
  web_app_add_to_home_screen: '8.0',
  web_app_check_home_screen: '8.0',
  web_app_start_accelerometer: '8.0',
  web_app_start_gyroscope: '8.0',
  web_app_start_device_orientation: '8.0',
  web_app_request_location: '8.0',
  web_app_open_location_settings: '8.0',
};

// ⚠️ Grouped from reference milestones but NOT re-verified against the changelog in
// this pass — confirm the exact version before relying on these for gating.
const UNVERIFIED: Record<string, string> = {
  web_app_biometry_request_access: '7.2',
  web_app_biometry_request_auth: '7.2',
  web_app_biometry_get_info: '7.2',
  web_app_biometry_open_settings: '7.2',
  web_app_setup_secondary_button: '7.10',
  web_app_set_bottom_bar_color: '7.10',
  web_app_share_to_story: '7.8',
};

export const METHOD_MIN_VERSION: Readonly<Record<string, string>> = {
  ...CONFIRMED,
  ...UNVERIFIED,
};
