import type { MockUser } from '@tmakit/core';

/**
 * Persisted overrides the panel applies on the next load. initData is parsed by the
 * SDK at init time, so changing the user takes effect via reload — we stash the desired
 * launch params here (sessionStorage, dev-only) and read them back on startup.
 */
export interface LaunchParamsOverride {
  user?: MockUser;
  themeParams?: Record<string, string>;
  platform?: string;
  version?: string;
  startParam?: string;
}

const KEY = 'tmakit:devtools:override';

export function loadLaunchParamsOverride(): LaunchParamsOverride | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LaunchParamsOverride) : null;
  } catch {
    return null;
  }
}

export function saveLaunchParamsOverride(override: LaunchParamsOverride): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(KEY, JSON.stringify(override));
}

export function clearLaunchParamsOverride(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(KEY);
}
