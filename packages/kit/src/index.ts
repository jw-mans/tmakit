/**
 * tma-kit — runtime helpers for Telegram Mini Apps. Ships to production.
 *
 * SDK-agnostic: wrap the app in <TmaProvider bridge={...}> with the bridge from
 * `@tma.js/bridge` or `@telegram-apps/bridge`; hooks read it from context. Everything
 * tree-shakeable. Opinionated layers the SDK deliberately leaves out.
 */
export const KIT_VERSION = '0.0.0';

export { TmaProvider, useTmaBridge } from './bridge';
export type { TmaBridge, TmaProviderProps } from './bridge';

export { CSS_VARS } from './cssVars';
export type { StyleTarget } from './cssVars';

export { useViewport, parseViewportEvent, applyViewportVars } from './viewport';
export type { ViewportState, UseViewportOptions } from './viewport';

export {
  useSafeArea,
  parseInsets,
  applySafeAreaVars,
  ZERO_INSETS,
} from './safeArea';
export type { Insets, SafeAreaKind, UseSafeAreaResult, UseSafeAreaOptions } from './safeArea';

export { useSupports } from './support';

export { useInitDataAuth } from './auth';
export type {
  UseInitDataAuthOptions,
  UseInitDataAuthResult,
  InitDataAuthState,
  AuthStatus,
} from './auth';

export {
  CLOUD_STORAGE_LIMITS,
  StorageLimitError,
  createCloudStorageAdapter,
  createLocalStorageAdapter,
  resolveStorageAdapter,
  createTypedStore,
} from './storage';
export type {
  StorageAdapter,
  StorageLike,
  Schema,
  TypedStore,
  CloudStorageOptions,
  LocalStorageOptions,
  ResolveStorageOptions,
  CreateTypedStoreOptions,
} from './storage';

export { useStoredState } from './useStoredState';
export type { UseStoredStateOptions, UseStoredStateResult } from './useStoredState';
