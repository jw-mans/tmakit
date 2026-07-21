import type { TmaBridge } from './bridge';

/**
 * Storage layer. A uniform async {@link StorageAdapter} backed either by Telegram
 * CloudStorage (over the bridge) or localStorage (fallback in dev / plain browser),
 * plus a typed store that serializes JSON and optionally validates with a schema.
 */

/** CloudStorage limits. Values are strings only. */
export const CLOUD_STORAGE_LIMITS = {
  keyMaxLength: 128,
  valueMaxLength: 4096,
  maxKeys: 1024,
} as const;

export class StorageLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageLimitError';
  }
}

export interface StorageAdapter {
  getItem(key: string): Promise<string>;
  getItems(keys: string[]): Promise<Record<string, string>>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getKeys(): Promise<string[]>;
}

// CloudStorage over the bridge (invoke_custom_method + req_id correlation)

export interface CloudStorageOptions {
  timeoutMs?: number;
}

const STORAGE_METHODS = {
  save: 'saveStorageValue',
  get: 'getStorageValues',
  keys: 'getStorageKeys',
  delete: 'deleteStorageValues',
} as const;

export function createCloudStorageAdapter(
  bridge: TmaBridge,
  options: CloudStorageOptions = {},
): StorageAdapter {
  let counter = 0;
  const timeoutMs = options.timeoutMs ?? 10_000;

  const invoke = (method: string, params: Record<string, unknown>): Promise<unknown> =>
    new Promise((resolve, reject) => {
      if (!bridge.postEvent) {
        reject(new Error('CloudStorage needs bridge.postEvent'));
        return;
      }
      const reqId = `tmakit-${Date.now()}-${++counter}`;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const off = bridge.on('custom_method_invoked', (payload: { req_id?: unknown; result?: unknown; error?: unknown }) => {
        if (!payload || payload.req_id !== reqId) return;
        cleanup();
        if (payload.error) reject(new Error(String(payload.error)));
        else resolve(payload.result);
      });
      const cleanup = () => {
        off();
        if (timer) clearTimeout(timer);
      };
      timer = setTimeout(() => {
        cleanup();
        reject(new Error('CloudStorage request timed out'));
      }, timeoutMs);
      bridge.postEvent('web_app_invoke_custom_method', { req_id: reqId, method, params });
    });

  return {
    async getItem(key) {
      const result = (await invoke(STORAGE_METHODS.get, { keys: [key] })) as Record<string, string>;
      return result?.[key] ?? '';
    },
    async getItems(keys) {
      const result = (await invoke(STORAGE_METHODS.get, { keys })) as Record<string, string>;
      const out: Record<string, string> = {};
      for (const key of keys) out[key] = result?.[key] ?? '';
      return out;
    },
    async setItem(key, value) {
      await invoke(STORAGE_METHODS.save, { key, value });
    },
    async removeItem(key) {
      await invoke(STORAGE_METHODS.delete, { keys: [key] });
    },
    async getKeys() {
      const result = await invoke(STORAGE_METHODS.keys, {});
      return Array.isArray(result) ? (result as string[]) : [];
    },
  };
}

// localStorage fallback

/** Minimal localStorage-like surface — injectable for tests / SSR. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly length: number;
  key(index: number): string | null;
}

export interface LocalStorageOptions {
  backend?: StorageLike;
  prefix?: string;
}

export function createLocalStorageAdapter(options: LocalStorageOptions = {}): StorageAdapter {
  const prefix = options.prefix ?? 'tmakit:';
  const backend = options.backend ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
  if (!backend) throw new Error('localStorage is not available');
  const full = (key: string) => prefix + key;

  return {
    async getItem(key) {
      return backend.getItem(full(key)) ?? '';
    },
    async getItems(keys) {
      const out: Record<string, string> = {};
      for (const key of keys) out[key] = backend.getItem(full(key)) ?? '';
      return out;
    },
    async setItem(key, value) {
      backend.setItem(full(key), value);
    },
    async removeItem(key) {
      backend.removeItem(full(key));
    },
    async getKeys() {
      const out: string[] = [];
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith(prefix)) out.push(k.slice(prefix.length));
      }
      return out;
    },
  };
}

// adapter resolution

export interface ResolveStorageOptions extends LocalStorageOptions {
  /** Force the localStorage fallback (e.g. dev preference). */
  forceLocal?: boolean;
  cloud?: CloudStorageOptions;
}

/** Pick CloudStorage when the bridge supports it, else fall back to localStorage. */
export function resolveStorageAdapter(bridge: TmaBridge, options: ResolveStorageOptions = {}): StorageAdapter {
  const cloudUsable =
    !options.forceLocal &&
    !!bridge.postEvent &&
    (bridge.isSupported ? bridge.isSupported('web_app_invoke_custom_method') : true);
  return cloudUsable ? createCloudStorageAdapter(bridge, options.cloud) : createLocalStorageAdapter(options);
}

// typed store

/** Anything with a `parse` that throws on invalid input (zod schemas qualify). */
export interface Schema<T> {
  parse(input: unknown): T;
}

export interface TypedStore<T> {
  get(): Promise<T | undefined>;
  set(value: T): Promise<void>;
  remove(): Promise<void>;
}

export interface CreateTypedStoreOptions<T> {
  adapter: StorageAdapter;
  key: string;
  /** Optional validator (e.g. a zod schema). Applied on read. */
  schema?: Schema<T>;
}

export function createTypedStore<T>(options: CreateTypedStoreOptions<T>): TypedStore<T> {
  const { adapter, key, schema } = options;
  if (key.length > CLOUD_STORAGE_LIMITS.keyMaxLength) {
    throw new StorageLimitError(`key exceeds ${CLOUD_STORAGE_LIMITS.keyMaxLength} chars`);
  }

  return {
    async get() {
      const raw = await adapter.getItem(key);
      if (!raw) return undefined;
      const parsed: unknown = JSON.parse(raw);
      return schema ? schema.parse(parsed) : (parsed as T);
    },
    async set(value) {
      const serialized = JSON.stringify(value);
      if (serialized.length > CLOUD_STORAGE_LIMITS.valueMaxLength) {
        throw new StorageLimitError(
          `serialized value exceeds ${CLOUD_STORAGE_LIMITS.valueMaxLength} chars`,
        );
      }
      await adapter.setItem(key, serialized);
    },
    async remove() {
      await adapter.removeItem(key);
    },
  };
}
