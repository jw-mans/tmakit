import { createMock, type CreateMockOptions, type MockController } from '@tmakit/core';
import type { TmaBridge } from 'tma-kit';

/**
 * A test double for the Telegram bridge, backed by the real core mock engine (the same
 * one the devtools panel uses). Wire it into `<TmaProvider bridge={bridge}>` to render
 * components that use tma-kit hooks, and drive events / inspect traffic via `mock`.
 */
export interface MockBridgeOptions extends Omit<CreateMockOptions, 'bridge'> {
  /** Client version reported to `useSupports` etc. Default: '8.0'. */
  version?: string;
}

export interface MockBridgeHandle {
  /** Pass this to `<TmaProvider bridge={...}>`. */
  bridge: TmaBridge;
  /** Drive events (`mock.emit`), inspect the log, resolve pending requests. */
  mock: MockController;
}

export function createMockBridge(options: MockBridgeOptions = {}): MockBridgeHandle {
  const { version = '8.0', ...mockOptions } = options;
  const listeners: Record<string, Set<(payload: unknown) => void>> = {};
  let onEvent: ((...args: unknown[]) => void) | undefined;

  const mock = createMock({
    ...mockOptions,
    bridge: {
      mockTelegramEnv: (config) => {
        onEvent = config.onEvent;
      },
      emitEvent: (name, payload) => {
        for (const cb of listeners[name] ?? []) cb(payload);
      },
    },
  });

  const bridge: TmaBridge = {
    on(event, listener) {
      (listeners[event] ??= new Set()).add(listener as (payload: unknown) => void);
      return () => {
        listeners[event]?.delete(listener as (payload: unknown) => void);
      };
    },
    postEvent(method, params) {
      onEvent?.(method, params);
    },
    version,
  };

  return { bridge, mock };
}
