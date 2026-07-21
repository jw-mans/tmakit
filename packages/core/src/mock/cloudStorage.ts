/**
 * In-memory CloudStorage simulation for the mock. Answers `web_app_invoke_custom_method`
 * calls for the storage methods (saveStorageValue / getStorageValues / getStorageKeys /
 * deleteStorageValues) with a `custom_method_invoked` event, so apps using CloudStorage
 * work end-to-end in dev without a real Telegram client.
 */
export interface CloudStorageSim {
  /** Handle an invoke_custom_method call; returns true if it was a storage method. */
  handle(params: unknown, emit: (name: string, payload?: unknown) => void): boolean;
  /** Direct access to the backing store (for panel inspection / seeding). */
  readonly store: Map<string, string>;
}

export function createCloudStorageSim(): CloudStorageSim {
  const store = new Map<string, string>();

  return {
    store,
    handle(rawParams, emit) {
      const p = (rawParams ?? {}) as { req_id?: unknown; method?: unknown; params?: unknown };
      const method = p.method;
      const reqId = p.req_id;
      const args = (p.params ?? {}) as { key?: unknown; value?: unknown; keys?: unknown };
      const respond = (result: unknown) => emit('custom_method_invoked', { req_id: reqId, result });

      switch (method) {
        case 'saveStorageValue':
          store.set(String(args.key), String(args.value ?? ''));
          respond('');
          return true;

        case 'getStorageValues': {
          const keys = Array.isArray(args.keys) ? (args.keys as string[]) : [];
          const out: Record<string, string> = {};
          for (const key of keys) out[key] = store.get(key) ?? '';
          respond(out);
          return true;
        }

        case 'getStorageKeys':
          respond([...store.keys()]);
          return true;

        case 'deleteStorageValues': {
          const keys = Array.isArray(args.keys) ? (args.keys as string[]) : [];
          for (const key of keys) store.delete(key);
          respond('');
          return true;
        }

        default:
          return false;
      }
    },
  };
}
