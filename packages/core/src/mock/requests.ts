import type { AutoResponse } from './autoResponder';

/**
 * A stateful async request from the app awaiting a response (popup, invoice, QR,
 * clipboard, biometry). Unlike instant requests (theme/viewport) these can't be
 * auto-answered — the panel presents a resolver and the developer chooses.
 */
export interface PendingRequest {
  id: number;
  name: string;
  params?: unknown;
  ts: number;
}

export interface RequestManager {
  /** Current pending requests, oldest first. Stable ref until the next mutation. */
  pending(): readonly PendingRequest[];
  subscribe(listener: (pending: readonly PendingRequest[]) => void): () => void;
  /** Queue a request (called by the mock). */
  add(name: string, params?: unknown): PendingRequest;
  /** Emit the given response event(s) and remove the request from the queue. */
  resolve(id: number, responses?: AutoResponse | AutoResponse[]): void;
  /** Remove the request without emitting anything. */
  dismiss(id: number): void;
}

export function createRequestManager(
  emit: (name: string, params?: unknown) => void,
): RequestManager {
  const listeners = new Set<(pending: readonly PendingRequest[]) => void>();
  let seq = 0;
  let items: PendingRequest[] = [];

  const notify = () => {
    for (const listener of listeners) listener(items);
  };

  return {
    pending() {
      return items;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add(name, params) {
      const request: PendingRequest = { id: ++seq, name, params, ts: Date.now() };
      items = [...items, request];
      notify();
      return request;
    },
    resolve(id, responses) {
      const list = responses ? (Array.isArray(responses) ? responses : [responses]) : [];
      for (const response of list) emit(response.name, response.params);
      items = items.filter((item) => item.id !== id);
      notify();
    },
    dismiss(id) {
      items = items.filter((item) => item.id !== id);
      notify();
    },
  };
}

/** Methods that open a stateful async flow — surfaced as pending, not auto-answered. */
export const DEFAULT_INTERACTIVE_METHODS: readonly string[] = [
  'web_app_open_popup',
  'web_app_open_invoice',
  'web_app_open_scan_qr_popup',
  'web_app_read_text_from_clipboard',
  'web_app_biometry_request_access',
  'web_app_biometry_request_auth',
];
