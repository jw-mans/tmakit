/**
 * @tmakit/core — shared foundation.
 *
 * SDK-agnostic bridge-protocol types, the request→response event map, an in-memory
 * bridge log, an auto-responder and the `createMock` wiring. The bridge itself is
 * injected by the consumer (`@tma.js/bridge` or `@telegram-apps/bridge`) so core
 * never depends on a specific SDK. No React here — pure TS, tree-shakeable.
 */
export const CORE_VERSION = '0.0.0';

// Protocol
export type {
  BridgeCall,
  BridgeDirection,
  BridgeEventName,
  BridgeLogEntry,
  BridgeMethodName,
  BridgePort,
  MockLaunchParams,
} from './protocol/types';
export { REQUEST_RESPONSE } from './protocol/events';

// Mock engine
export { createMock } from './mock/createMock';
export type { CreateMockOptions, MockController } from './mock/createMock';

export { createBridgeLogger } from './mock/logger';
export type { BridgeLogger, BridgeLoggerOptions } from './mock/logger';

export { createAutoResponder } from './mock/autoResponder';
export type {
  AutoResponse,
  AutoResponderOptions,
  AutoResponderRule,
  Insets,
} from './mock/autoResponder';

export { createRequestManager, DEFAULT_INTERACTIVE_METHODS } from './mock/requests';
export type { PendingRequest, RequestManager } from './mock/requests';

// Version / platform gating
export { METHOD_MIN_VERSION } from './support/versionMap';
export { compareVersions, isMethodSupported } from './support/isSupported';

export { normalizeOnEventArgs } from './mock/normalizeCall';

export { buildInitData, buildLaunchParams, DEFAULT_THEME_PARAMS, DEFAULT_USER } from './mock/defaults';
export type { BuildLaunchParamsOptions, MockUser } from './mock/defaults';
