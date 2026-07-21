import type { BridgeDirection, BridgeLogEntry } from '../protocol/types';

export interface BridgeLoggerOptions {
  /** Max retained entries (ring buffer). Default 500. */
  limit?: number;
}

export interface BridgeLogger {
  /** Record a call in the given direction; returns the created entry. */
  add(direction: BridgeDirection, name: string, params?: unknown): BridgeLogEntry;
  /** Current entries, oldest first. Stable reference until the next mutation. */
  entries(): readonly BridgeLogEntry[];
  clear(): void;
  /** Subscribe to changes. Returns an unsubscribe function. */
  subscribe(listener: (entries: readonly BridgeLogEntry[]) => void): () => void;
}

/** In-memory bridge log with a bounded ring buffer and change subscriptions. */
export function createBridgeLogger(options: BridgeLoggerOptions = {}): BridgeLogger {
  const limit = Math.max(1, options.limit ?? 500);
  const listeners = new Set<(entries: readonly BridgeLogEntry[]) => void>();
  let seq = 0;
  let items: BridgeLogEntry[] = [];

  const notify = () => {
    for (const listener of listeners) listener(items);
  };

  return {
    add(direction, name, params) {
      const entry: BridgeLogEntry = { id: ++seq, direction, name, params, ts: Date.now() };
      // New array each time so subscribers can rely on reference identity.
      items = items.length >= limit ? [...items.slice(items.length - limit + 1), entry] : [...items, entry];
      notify();
      return entry;
    },
    entries() {
      return items;
    },
    clear() {
      items = [];
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
