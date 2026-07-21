/**
 * Playwright E2E helper. The mock runs inside the page (the app exposes its
 * MockController on `window[MOCK_GLOBAL_KEY]` in dev); this driver controls it from the
 * test via `page.evaluate`, so E2E can answer postEvents and inject events without a
 * real Telegram client. Typed against a minimal `PageLike` — no @playwright/test dep.
 */
export const MOCK_GLOBAL_KEY = '__tmakit_mock__';

export interface PageLike {
  evaluate<R, A>(fn: (arg: A) => R, arg: A): Promise<R>;
}

export interface BridgeLogEntryLike {
  id: number;
  direction: 'out' | 'in';
  name: string;
  params?: unknown;
  ts: number;
}

export interface PendingRequestLike {
  id: number;
  name: string;
  params?: unknown;
  ts: number;
}

export interface TmaPageDriver {
  /** Emit an event into the app (client -> app). */
  emit(name: string, params?: unknown): Promise<void>;
  /** Snapshot of the bridge log. */
  log(): Promise<BridgeLogEntryLike[]>;
  /** Pending stateful async requests. */
  pending(): Promise<PendingRequestLike[]>;
  /** Resolve a pending request by id with response event(s). */
  resolveRequest(id: number, responses?: unknown): Promise<void>;
}

// Each evaluate body must be self-contained — Playwright serializes only the function
// itself, not outer-scope helpers, so window access is inlined.
export function createTmaPageDriver(page: PageLike, key: string = MOCK_GLOBAL_KEY): TmaPageDriver {
  return {
    emit(name, params) {
      return page.evaluate(
        (a: { key: string; name: string; params: unknown }) => {
          (window as unknown as Record<string, any>)[a.key].emit(a.name, a.params);
        },
        { key, name, params },
      );
    },
    log() {
      return page.evaluate(
        (k: string) => (window as unknown as Record<string, any>)[k].logger.entries(),
        key,
      );
    },
    pending() {
      return page.evaluate(
        (k: string) => (window as unknown as Record<string, any>)[k].requests.pending(),
        key,
      );
    },
    resolveRequest(id, responses) {
      return page.evaluate(
        (a: { key: string; id: number; responses: unknown }) => {
          (window as unknown as Record<string, any>)[a.key].requests.resolve(a.id, a.responses);
        },
        { key, id, responses },
      );
    },
  };
}
