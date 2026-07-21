import { createContext, useContext, type ReactNode } from 'react';

/**
 * The bridge surface tma-kit hooks need, injected by the app. SDK-agnostic: pass
 * `on`/`postEvent`/`isSupported` from `@tma.js/bridge` or `@telegram-apps/bridge`.
 * Only `on` is required; the rest unlock extra behavior when present.
 */
export interface TmaBridge {
  /** Subscribe to a client -> app event. Returns an unsubscribe function. */
  on(event: string, listener: (payload: any) => void): () => void;
  /** Send an app -> client method. */
  postEvent?(method: string, params?: unknown): void;
  /** Feature-gate: whether a method is supported by the current client/version. */
  isSupported?(method: string): boolean;
  /** Current client version (e.g. "8.0"). Used to fall back to the version map. */
  version?: string;
}

const BridgeContext = createContext<TmaBridge | null>(null);

export interface TmaProviderProps {
  bridge: TmaBridge;
  children: ReactNode;
}

export function TmaProvider({ bridge, children }: TmaProviderProps) {
  return <BridgeContext.Provider value={bridge}>{children}</BridgeContext.Provider>;
}

export function useTmaBridge(): TmaBridge {
  const bridge = useContext(BridgeContext);
  if (!bridge) {
    throw new Error('useTmaBridge: wrap your app in <TmaProvider bridge={...}>.');
  }
  return bridge;
}
