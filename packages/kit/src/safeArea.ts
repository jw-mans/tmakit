import { useEffect, useState } from 'react';
import { CSS_VARS, defaultStyleTarget, type StyleTarget } from './cssVars';
import { useTmaBridge } from './bridge';

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const ZERO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export type SafeAreaKind = 'safe' | 'content';

/** Parse a `safe_area_changed` / `content_safe_area_changed` payload into insets. */
export function parseInsets(params: unknown): Insets {
  const p = (params ?? {}) as Record<string, unknown>;
  return {
    top: Number(p.top ?? 0),
    right: Number(p.right ?? 0),
    bottom: Number(p.bottom ?? 0),
    left: Number(p.left ?? 0),
  };
}

const VAR_MAP: Record<SafeAreaKind, Record<keyof Insets, string>> = {
  safe: {
    top: CSS_VARS.safeAreaTop,
    right: CSS_VARS.safeAreaRight,
    bottom: CSS_VARS.safeAreaBottom,
    left: CSS_VARS.safeAreaLeft,
  },
  content: {
    top: CSS_VARS.contentSafeAreaTop,
    right: CSS_VARS.contentSafeAreaRight,
    bottom: CSS_VARS.contentSafeAreaBottom,
    left: CSS_VARS.contentSafeAreaLeft,
  },
};

/** Write safe-area (or content-safe-area) insets to CSS vars. */
export function applySafeAreaVars(
  kind: SafeAreaKind,
  insets: Insets,
  target = defaultStyleTarget(),
): void {
  if (!target) return;
  const vars = VAR_MAP[kind];
  target.style.setProperty(vars.top, `${insets.top}px`);
  target.style.setProperty(vars.right, `${insets.right}px`);
  target.style.setProperty(vars.bottom, `${insets.bottom}px`);
  target.style.setProperty(vars.left, `${insets.left}px`);
}

export interface UseSafeAreaResult {
  safeArea: Insets;
  contentSafeArea: Insets;
}

export interface UseSafeAreaOptions {
  requestOnMount?: boolean;
  target?: StyleTarget;
}

/**
 * Track device safe area and content safe area, mirroring both into CSS vars
 * (`--tg-safe-area-inset-*`, `--tg-content-safe-area-inset-*`).
 */
export function useSafeArea(options: UseSafeAreaOptions = {}): UseSafeAreaResult {
  const bridge = useTmaBridge();
  const { requestOnMount = true, target } = options;
  const [safeArea, setSafeArea] = useState<Insets>(ZERO_INSETS);
  const [contentSafeArea, setContentSafeArea] = useState<Insets>(ZERO_INSETS);

  useEffect(() => {
    const offSafe = bridge.on('safe_area_changed', (payload: unknown) => {
      const insets = parseInsets(payload);
      applySafeAreaVars('safe', insets, target);
      setSafeArea(insets);
    });
    const offContent = bridge.on('content_safe_area_changed', (payload: unknown) => {
      const insets = parseInsets(payload);
      applySafeAreaVars('content', insets, target);
      setContentSafeArea(insets);
    });
    if (requestOnMount) {
      bridge.postEvent?.('web_app_request_safe_area');
      bridge.postEvent?.('web_app_request_content_safe_area');
    }
    return () => {
      offSafe();
      offContent();
    };
  }, [bridge, requestOnMount, target]);

  return { safeArea, contentSafeArea };
}
