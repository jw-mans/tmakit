import type { BridgeCall } from '../protocol/types';

/** An event to emit back into the app in response to a call. */
export interface AutoResponse {
  name: string;
  params?: unknown;
}

/** A custom rule; returning a value short-circuits the built-in responses. */
export type AutoResponderRule = (call: BridgeCall) => AutoResponse | AutoResponse[] | void;

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface AutoResponderOptions {
  themeParams?: Record<string, string>;
  viewport?: { height?: number; width?: number; isExpanded?: boolean };
  safeAreaInsets?: Insets;
  contentSafeAreaInsets?: Insets;
  /** Extra rules, run before the built-ins. First one to return a value wins. */
  rules?: AutoResponderRule[];
}

const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

function viewportHeight(): number {
  return typeof window !== 'undefined' ? window.innerHeight : 800;
}

function viewportWidth(): number {
  return typeof window !== 'undefined' ? window.innerWidth : 400;
}

/**
 * Build a responder that maps the instant, stateless layout requests to their
 * `*_changed` events so the app doesn't hang waiting
 */
export function createAutoResponder(options: AutoResponderOptions = {}) {
  const rules = options.rules ?? [];

  return function respond(call: BridgeCall): AutoResponse[] {
    for (const rule of rules) {
      const result = rule(call);
      if (result) return Array.isArray(result) ? result : [result];
    }

    switch (call.name) {
      case 'web_app_request_theme':
        return [{ name: 'theme_changed', params: { theme_params: options.themeParams ?? {} } }];

      case 'web_app_request_viewport':
        return [
          {
            name: 'viewport_changed',
            params: {
              height: options.viewport?.height ?? viewportHeight(),
              width: options.viewport?.width ?? viewportWidth(),
              is_expanded: options.viewport?.isExpanded ?? true,
              is_state_stable: true,
            },
          },
        ];

      case 'web_app_request_safe_area':
        return [{ name: 'safe_area_changed', params: options.safeAreaInsets ?? NO_INSETS }];

      case 'web_app_request_content_safe_area':
        return [
          { name: 'content_safe_area_changed', params: options.contentSafeAreaInsets ?? NO_INSETS },
        ];

      default:
        return [];
    }
  };
}
