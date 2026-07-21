import type { BridgeCall, BridgePort, MockLaunchParams } from '../protocol/types';
import { createBridgeLogger, type BridgeLogger, type BridgeLoggerOptions } from './logger';
import { createAutoResponder, type AutoResponderOptions } from './autoResponder';
import { normalizeOnEventArgs } from './normalizeCall';
import { buildLaunchParams, DEFAULT_THEME_PARAMS, type BuildLaunchParamsOptions } from './defaults';
import {
  createRequestManager,
  DEFAULT_INTERACTIVE_METHODS,
  type RequestManager,
} from './requests';
import { createCloudStorageSim, type CloudStorageSim } from './cloudStorage';

export interface CreateMockOptions {
  /**
   * Bridge functions from `@tma.js/bridge` or `@telegram-apps/bridge`. Injected so
   * core stays SDK-agnostic — app and mock share the consumer's bridge instance.
   */
  bridge: BridgePort;
  /** Explicit launch parameters. Omit to build a realistic default from `defaults`. */
  launchParams?: MockLaunchParams;
  /** Shortcut for building default launch params (ignored when `launchParams` is set). */
  defaults?: BuildLaunchParamsOptions;
  /** Auto-answer request events so the app never hangs. Default: true. */
  autoRespond?: boolean;
  autoResponder?: AutoResponderOptions;
  logger?: BridgeLoggerOptions;
  /**
   * Methods that open a stateful async flow (popup, invoice, QR, clipboard, biometry).
   * These are surfaced as pending requests instead of being auto-answered. Defaults to
   * {@link DEFAULT_INTERACTIVE_METHODS}.
   */
  interactiveMethods?: readonly string[];
  /** Simulate CloudStorage in-memory (answers invoke_custom_method). Default: true. */
  cloudStorage?: boolean;
  /** Called for every outgoing app → client call, after it is logged. */
  onCall?: (call: BridgeCall) => void;
}

export interface MockController {
  /** The bridge log (both directions). Subscribe for a live "network tab". */
  readonly logger: BridgeLogger;
  /** Pending stateful async requests awaiting a panel-driven response. */
  readonly requests: RequestManager;
  /** In-memory CloudStorage simulation (undefined if disabled). */
  readonly cloudStorage?: CloudStorageSim;
  /** Emit an event into the app (client → app); also recorded in the log as 'in'. */
  emit(name: string, params?: unknown): void;
}

/**
 * Wire a Telegram client mock onto the injected bridge: log every `postEvent`,
 * auto-answer request events, and expose `emit()` to push events into the app.
 * Call this once, before the app's SDK initializes.
 */
export function createMock(options: CreateMockOptions): MockController {
  const { bridge } = options;
  const logger = createBridgeLogger(options.logger);
  const autoRespond = options.autoRespond ?? true;

  const themeParams =
    options.launchParams?.tgWebAppThemeParams ??
    options.defaults?.themeParams ??
    options.autoResponder?.themeParams ??
    { ...DEFAULT_THEME_PARAMS };

  const respond = createAutoResponder({ themeParams, ...options.autoResponder });

  const emit = (name: string, params?: unknown): void => {
    logger.add('in', name, params);
    bridge.emitEvent(name, params);
  };

  const requests = createRequestManager(emit);
  const interactive = new Set(options.interactiveMethods ?? DEFAULT_INTERACTIVE_METHODS);
  const cloudStorage = options.cloudStorage === false ? undefined : createCloudStorageSim();

  const launchParams = options.launchParams ?? buildLaunchParams(options.defaults);

  bridge.mockTelegramEnv({
    launchParams,
    onEvent: (...args: unknown[]): void => {
      const call = normalizeOnEventArgs(args);
      logger.add('out', call.name, call.params);
      options.onCall?.(call);
      // CloudStorage simulation answers invoke_custom_method for storage methods.
      if (cloudStorage && call.name === 'web_app_invoke_custom_method' && cloudStorage.handle(call.params, emit)) {
        return;
      }
      // Stateful async flows wait for a panel-driven response.
      if (interactive.has(call.name)) {
        requests.add(call.name, call.params);
        return;
      }
      if (autoRespond) {
        for (const response of respond(call)) emit(response.name, response.params);
      }
    },
  });

  return { logger, requests, cloudStorage, emit };
}
