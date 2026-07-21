import type { BridgeCall } from '../protocol/types';

/**
 * Normalize the differing `onEvent` signatures into one {@link BridgeCall}:
 * - `@telegram-apps/bridge` (older): tuple `(method, payload)`
 * - `@tma.js/bridge` (newer): object `{ name | event, params }`
 *
 * Detection is by shape at runtime, so we don't need to know which bridge is in use.
 */
export function normalizeOnEventArgs(args: readonly unknown[]): BridgeCall {
  const [first, second] = args;

  // Tuple style: (method: string, payload?)
  if (typeof first === 'string') {
    return { name: first, params: second };
  }

  // Object style: { name | event, params }
  if (first && typeof first === 'object') {
    const obj = first as Record<string, unknown>;
    const name = (obj.name ?? obj.event) as string;
    const params = 'params' in obj ? obj.params : second;
    return { name, params };
  }

  return { name: String(first), params: second };
}
