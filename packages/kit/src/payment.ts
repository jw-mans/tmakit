import { useCallback, useState } from 'react';
import { useTmaBridge, type TmaBridge } from './bridge';

/** Terminal statuses of an invoice, as reported by `invoice_closed`. */
export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

export interface OpenInvoiceOptions {
  timeoutMs?: number;
}

/**
 * Open a Stars invoice by slug and resolve with its terminal status. Correlates the
 * `invoice_closed` event by slug so concurrent invoices don't cross wires. Pure (no
 * React) — the hook wraps it.
 */
export function openInvoice(
  bridge: TmaBridge,
  slug: string,
  options: OpenInvoiceOptions = {},
): Promise<InvoiceStatus> {
  return new Promise((resolve, reject) => {
    if (!bridge.postEvent) {
      reject(new Error('payment needs bridge.postEvent'));
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const off = bridge.on('invoice_closed', (payload: { slug?: string; status?: InvoiceStatus }) => {
      if (!payload || payload.slug !== slug) return;
      cleanup();
      resolve(payload.status ?? 'failed');
    });
    const cleanup = () => {
      off();
      if (timer) clearTimeout(timer);
    };
    if (options.timeoutMs) {
      timer = setTimeout(() => {
        cleanup();
        reject(new Error('invoice timed out'));
      }, options.timeoutMs);
    }
    bridge.postEvent('web_app_open_invoice', { slug });
  });
}

export interface PaymentState {
  status: 'idle' | 'opening' | InvoiceStatus;
  slug: string | null;
  error: string | null;
}

export interface UsePaymentResult extends PaymentState {
  /** Open an invoice; resolves with the terminal status and updates `status`. */
  open(slug: string, options?: OpenInvoiceOptions): Promise<InvoiceStatus>;
  reset(): void;
}

/** Unified payment hook over `open_invoice` / `invoice_closed` with retryable status. */
export function usePayment(): UsePaymentResult {
  const bridge = useTmaBridge();
  const [state, setState] = useState<PaymentState>({ status: 'idle', slug: null, error: null });

  const open = useCallback(
    async (slug: string, options?: OpenInvoiceOptions) => {
      setState({ status: 'opening', slug, error: null });
      try {
        const status = await openInvoice(bridge, slug, options);
        setState({ status, slug, error: null });
        return status;
      } catch (e) {
        setState({ status: 'failed', slug, error: e instanceof Error ? e.message : 'payment_failed' });
        throw e;
      }
    },
    [bridge],
  );

  const reset = useCallback(() => setState({ status: 'idle', slug: null, error: null }), []);

  return { ...state, open, reset };
}
