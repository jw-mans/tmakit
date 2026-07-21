import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Client hook: exchange raw initData for a session token once, then refresh.
 * SDK-agnostic — pass the raw initData from your SDK (e.g. `retrieveRawInitData()`).
 * The token exchange and validation happen on YOUR backend (see tma-kit/server).
 */

export interface UseInitDataAuthOptions {
  /** Backend endpoint that validates initData and returns `{ token }`. */
  endpoint: string;
  /** Raw initData string from the SDK. */
  initData: string;
  /** Authorization scheme prefix. Default: 'tma'. */
  scheme?: string;
  /** Inject a fetch implementation (tests / non-browser). */
  fetchImpl?: typeof fetch;
  /** Exchange automatically on mount. Default: true. */
  autoStart?: boolean;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface InitDataAuthState {
  status: AuthStatus;
  token: string | null;
  error: string | null;
}

export interface UseInitDataAuthResult extends InitDataAuthState {
  /** Re-run the exchange (e.g. after the token expires). */
  refresh: () => Promise<void>;
}

export function useInitDataAuth(options: UseInitDataAuthOptions): UseInitDataAuthResult {
  const { endpoint, initData, scheme = 'tma', autoStart = true } = options;
  const fetchImpl = options.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);

  const [state, setState] = useState<InitDataAuthState>({ status: 'idle', token: null, error: null });
  const initDataRef = useRef(initData);
  initDataRef.current = initData;

  const refresh = useCallback(async () => {
    if (!fetchImpl) {
      setState({ status: 'error', token: null, error: 'no_fetch' });
      return;
    }
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `${scheme} ${initDataRef.current}`,
        },
        body: JSON.stringify({ initData: initDataRef.current }),
      });
      if (!res.ok) {
        setState({ status: 'error', token: null, error: `http_${res.status}` });
        return;
      }
      const data = (await res.json()) as { token?: string };
      setState({ status: 'authenticated', token: data.token ?? null, error: null });
    } catch (e) {
      setState({ status: 'error', token: null, error: e instanceof Error ? e.message : 'fetch_failed' });
    }
  }, [endpoint, scheme, fetchImpl]);

  useEffect(() => {
    if (autoStart) void refresh();
  }, [autoStart, refresh]);

  return { ...state, refresh };
}
