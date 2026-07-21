/** CSS custom properties tma-kit writes on the document root. Matches the Telegram
 * ecosystem naming so existing styles keep working. */
export const CSS_VARS = {
  viewportHeight: '--tg-viewport-height',
  viewportStableHeight: '--tg-viewport-stable-height',
  viewportWidth: '--tg-viewport-width',

  safeAreaTop: '--tg-safe-area-inset-top',
  safeAreaRight: '--tg-safe-area-inset-right',
  safeAreaBottom: '--tg-safe-area-inset-bottom',
  safeAreaLeft: '--tg-safe-area-inset-left',

  contentSafeAreaTop: '--tg-content-safe-area-inset-top',
  contentSafeAreaRight: '--tg-content-safe-area-inset-right',
  contentSafeAreaBottom: '--tg-content-safe-area-inset-bottom',
  contentSafeAreaLeft: '--tg-content-safe-area-inset-left',
} as const;

/** Minimal shape we need to write CSS vars — lets us unit-test without a real DOM. */
export interface StyleTarget {
  style: { setProperty(property: string, value: string): void };
}

/** Resolve the default target (document root) or undefined in non-DOM environments. */
export function defaultStyleTarget(): StyleTarget | undefined {
  return typeof document !== 'undefined' ? document.documentElement : undefined;
}
