// Set up the Telegram client mock BEFORE the app's SDK touches the environment.
// main.tsx imports this first. In a real app this lives behind import.meta.env.DEV.
import { mockTelegramEnv, emitEvent } from '@telegram-apps/bridge';
import { createMock, type BridgePort } from '@tmakit/core';
import { loadLaunchParamsOverride } from 'tma-devtools';

// SDK-agnostic injection: hand core the bridge functions. Swapping to
// `@tma.js/bridge` here would be the only change needed.
const bridge: BridgePort = {
  mockTelegramEnv: mockTelegramEnv as BridgePort['mockTelegramEnv'],
  emitEvent,
};

// Overrides written by the panel (user/theme edits) apply on reload.
const override = loadLaunchParamsOverride();

export const mock = createMock({
  bridge,
  defaults: {
    user: { id: 99281932, first_name: 'Test', username: 'testuser', language_code: 'en' },
    platform: 'tdesktop',
    version: '8.0',
    ...override,
  },
});
