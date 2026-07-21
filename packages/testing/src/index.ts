/**
 * @tmakit/testing — dev-only test utilities on the same mock engine as the panel.
 *
 * - `createMockBridge()` — a bridge test double for unit tests (Vitest + jsdom): render
 *   components using tma-kit hooks and drive events / inspect traffic.
 * - `createTmaPageDriver(page)` — Playwright E2E driver over the in-page mock.
 */
export { createMockBridge } from './bridge';
export type { MockBridgeOptions, MockBridgeHandle } from './bridge';

export { createTmaPageDriver, MOCK_GLOBAL_KEY } from './playwright';
export type {
  PageLike,
  TmaPageDriver,
  BridgeLogEntryLike,
  PendingRequestLike,
} from './playwright';
