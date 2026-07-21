import { useEffect, useState } from 'react';
import { CSS_VARS, defaultStyleTarget, type StyleTarget } from './cssVars';
import { useTmaBridge } from './bridge';

export interface ViewportState {
  height: number;
  width: number;
  isExpanded: boolean;
  /** Whether the height is stable (not mid-animation). */
  isStable: boolean;
}

const INITIAL: ViewportState = { height: 0, width: 0, isExpanded: false, isStable: false };

/** Extract the fields we care about from a `viewport_changed` payload (coercing types). */
export function parseViewportEvent(params: unknown): Partial<ViewportState> {
  const p = (params ?? {}) as Record<string, unknown>;
  const out: Partial<ViewportState> = {};
  if (p.height != null) out.height = Number(p.height);
  if (p.width != null) out.width = Number(p.width);
  if (p.is_expanded != null) out.isExpanded = Boolean(p.is_expanded);
  if (p.is_state_stable != null) out.isStable = Boolean(p.is_state_stable);
  return out;
}

/** Write viewport CSS vars. Stable height only updates when the state is stable, so
 * layouts pinned to `--tg-viewport-stable-height` don't jump mid-animation. */
export function applyViewportVars(state: ViewportState, target = defaultStyleTarget()): void {
  if (!target) return;
  target.style.setProperty(CSS_VARS.viewportHeight, `${state.height}px`);
  target.style.setProperty(CSS_VARS.viewportWidth, `${state.width}px`);
  if (state.isStable) {
    target.style.setProperty(CSS_VARS.viewportStableHeight, `${state.height}px`);
  }
}

export interface UseViewportOptions {
  /** Request the viewport on mount (if the bridge can postEvent). Default true. */
  requestOnMount?: boolean;
  /** Where to write CSS vars. Default: document root. */
  target?: StyleTarget;
}

/**
 * Track the Telegram viewport and mirror it into CSS vars. Waits for
 * `viewport_changed` and exposes a stable height, so content stops jumping on expand.
 */
export function useViewport(options: UseViewportOptions = {}): ViewportState {
  const bridge = useTmaBridge();
  const { requestOnMount = true, target } = options;
  const [state, setState] = useState<ViewportState>(INITIAL);

  useEffect(() => {
    const off = bridge.on('viewport_changed', (payload: unknown) => {
      setState((prev) => {
        const next = { ...prev, ...parseViewportEvent(payload) };
        applyViewportVars(next, target);
        return next;
      });
    });
    if (requestOnMount) bridge.postEvent?.('web_app_request_viewport');
    return off;
  }, [bridge, requestOnMount, target]);

  return state;
}
