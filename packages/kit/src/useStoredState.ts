import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTmaBridge } from './bridge';
import {
  createTypedStore,
  resolveStorageAdapter,
  type ResolveStorageOptions,
  type Schema,
} from './storage';

export interface UseStoredStateOptions<T> {
  schema?: Schema<T>;
  initial?: T;
  storage?: ResolveStorageOptions;
}

export interface UseStoredStateResult<T> {
  value: T | undefined;
  setValue: (value: T) => Promise<void>;
  remove: () => Promise<void>;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Persist a piece of state in CloudStorage (or localStorage fallback), typed and
 * optionally schema-validated. Loads on mount; writes on `setValue`.
 */
export function useStoredState<T>(
  key: string,
  options: UseStoredStateOptions<T> = {},
): UseStoredStateResult<T> {
  const bridge = useTmaBridge();
  const { initial, schema, storage } = options;

  const store = useMemo(
    () => createTypedStore<T>({ adapter: resolveStorageAdapter(bridge, storage), key, schema }),
    [bridge, key],
  );

  const [value, setValueState] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await store.get();
      setValueState(loaded ?? initial);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'load_failed');
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setValue = useCallback(
    async (next: T) => {
      setValueState(next);
      try {
        await store.set(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'save_failed');
      }
    },
    [store],
  );

  const remove = useCallback(async () => {
    setValueState(undefined);
    try {
      await store.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'remove_failed');
    }
  }, [store]);

  return { value, setValue, remove, loading, error, reload };
}
