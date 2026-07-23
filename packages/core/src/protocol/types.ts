/** Bridge protocol types. Names are kept as loose strings on purpose — the exact
 * method/event set depends on the SDK and client version, so we don't hardcode an
 * exhaustive enum. */

/** A method the app sends to the client (app -> client), e.g. "web_app_request_theme". */
export type BridgeMethodName = string;

/** An event the client sends to the app (client -> app), e.g. "theme_changed". */
export type BridgeEventName = string;

/** 'out' = app -> client (postEvent); 'in' = client -> app (emitted event). */
export type BridgeDirection = 'out' | 'in';

/** A normalized outgoing bridge call, as seen at the transport level. */
export interface BridgeCall {
  name: BridgeMethodName;
  params?: unknown;
}

/** A single entry in the bridge log (the "network tab" for the bridge). */
export interface BridgeLogEntry {
  id: number;
  direction: BridgeDirection;
  name: string;
  params?: unknown;
  /** Epoch milliseconds. */
  ts: number;
}

/** Telegram launch parameters (tgWebApp*-prefixed). Loosely typed on purpose. */
export interface MockLaunchParams {
  tgWebAppData?: string | URLSearchParams;
  tgWebAppThemeParams?: Record<string, string>;
  tgWebAppStartParam?: string;
  tgWebAppVersion?: string;
  tgWebAppPlatform?: string;
  [key: string]: unknown;
}

/**
 * The two bridge functions core needs, injected by the consumer. This is what
 * makes tmakit SDK-agnostic: pass them from `@tma.js/bridge` OR
 * `@telegram-apps/bridge` — core never imports a bridge itself.
 */
export interface BridgePort {
  mockTelegramEnv: (config: {
    launchParams?: MockLaunchParams | string;
    // Signature differs across bridges (tuple vs object) — core normalizes it.
    onEvent?: (...args: any[]) => void;
  }) => void;
  emitEvent: (name: string, params?: unknown) => void;
}
