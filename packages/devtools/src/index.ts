/**
 * tma-devtools — dev-only mock + interactive panel.
 *
 * HARD RULE: mount the panel ONLY behind `import.meta.env.DEV`, keep in
 * devDependencies. Mock/panel code must never reach production — dead weight and a
 * security hole. The Telegram client mock itself lives in @tmakit/core (createMock);
 * this package is the UI on top of a MockController.
 */
export const DEVTOOLS_VERSION = '0.0.0';

export { DevtoolsPanel } from './panel/DevtoolsPanel';
export type { DevtoolsPanelProps } from './panel/DevtoolsPanel';

export { USER_PRESETS } from './presets';
export type { UserPreset } from './presets';

export { DARK_THEME_PARAMS, LIGHT_THEME_PARAMS, THEME_PARAMS } from './theme';
export type { ThemeMode } from './theme';

export {
  loadLaunchParamsOverride,
  saveLaunchParamsOverride,
  clearLaunchParamsOverride,
} from './override';
export type { LaunchParamsOverride } from './override';
