import { DEFAULT_THEME_PARAMS } from '@tmakit/core';

/** Telegram dark theme (re-exported from core's default). */
export const DARK_THEME_PARAMS: Readonly<Record<string, string>> = DEFAULT_THEME_PARAMS;

/** Telegram light theme params. */
export const LIGHT_THEME_PARAMS: Readonly<Record<string, string>> = {
  accent_text_color: '#168acd',
  bg_color: '#ffffff',
  button_color: '#40a7e3',
  button_text_color: '#ffffff',
  destructive_text_color: '#d14e4e',
  header_bg_color: '#527da3',
  hint_color: '#999999',
  link_color: '#168acd',
  secondary_bg_color: '#f1f1f1',
  section_bg_color: '#ffffff',
  section_header_text_color: '#168acd',
  subtitle_text_color: '#999999',
  text_color: '#000000',
};

export type ThemeMode = 'light' | 'dark';

export const THEME_PARAMS: Record<ThemeMode, Readonly<Record<string, string>>> = {
  light: LIGHT_THEME_PARAMS,
  dark: DARK_THEME_PARAMS,
};
