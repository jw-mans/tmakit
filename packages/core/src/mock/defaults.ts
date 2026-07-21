import type { MockLaunchParams } from '../protocol/types';

/** Telegram dark theme params — a realistic default so themed apps look right in dev. */
export const DEFAULT_THEME_PARAMS: Readonly<Record<string, string>> = {
  accent_text_color: '#6ab2f2',
  bg_color: '#17212b',
  button_color: '#5288c1',
  button_text_color: '#ffffff',
  destructive_text_color: '#ec3942',
  header_bg_color: '#17212b',
  hint_color: '#708499',
  link_color: '#6ab3f3',
  secondary_bg_color: '#232e3c',
  section_bg_color: '#17212b',
  section_header_text_color: '#6ab3f3',
  subtitle_text_color: '#708499',
  text_color: '#f5f5f5',
};

export interface MockUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export const DEFAULT_USER: Readonly<MockUser> = {
  id: 99281932,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  language_code: 'en',
  is_premium: false,
};

export interface BuildLaunchParamsOptions {
  user?: MockUser;
  themeParams?: Record<string, string>;
  startParam?: string;
  version?: string;
  platform?: string;
}

/**
 * Build an unsigned `initData` (tgWebAppData) query string. The hash/signature are
 * intentionally empty — the mock is client-side only and initData MUST be validated
 * on the server. Do not treat this as authentic.
 */
export function buildInitData(user: MockUser, startParam?: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set('user', JSON.stringify(user));
  params.set('auth_date', Math.floor(Date.now() / 1000).toString());
  params.set('hash', '');
  params.set('signature', '');
  if (startParam) params.set('start_param', startParam);
  return params;
}

/** Assemble realistic default launch parameters. */
export function buildLaunchParams(options: BuildLaunchParamsOptions = {}): MockLaunchParams {
  const user = options.user ?? DEFAULT_USER;
  return {
    tgWebAppData: buildInitData(user, options.startParam),
    tgWebAppThemeParams: options.themeParams ?? { ...DEFAULT_THEME_PARAMS },
    tgWebAppStartParam: options.startParam,
    tgWebAppVersion: options.version ?? '8.0',
    tgWebAppPlatform: options.platform ?? 'tdesktop',
  };
}
