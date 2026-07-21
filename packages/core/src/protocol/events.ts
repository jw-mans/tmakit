/**
 * Common request -> response event pairs the mock must auto-close so the app never hangs.
 * 
 * NOT exhaustive and version-dependent —
 * - treat as a starting point;
 * - verify against the bridge/changelog before relying on it.
 *
 * Only the instant, stateless layout requests live here. 
 * Stateful async flows 
 * - popup, 
 * - invoice, 
 * - qr, 
 * - biometry
 * are answered via panel interaction, not blind auto-close — those land in later milestones.
 */
export const REQUEST_RESPONSE: Readonly<Record<string, string>> = {
  web_app_request_theme: 'theme_changed',
  web_app_request_viewport: 'viewport_changed',
  web_app_request_safe_area: 'safe_area_changed',
  web_app_request_content_safe_area: 'content_safe_area_changed',
};
