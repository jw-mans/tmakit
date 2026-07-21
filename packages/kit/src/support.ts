import { useMemo } from 'react';
import { isMethodSupported } from '@tmakit/core';
import { useTmaBridge } from './bridge';

/**
 * Feature-gate a method. Prefers the SDK's own `isSupported` (most accurate), falls
 * back to the version map when only `version` is known, and is optimistic otherwise.
 *
 * Always gate with this before calling a fragmented method — never compare version
 * numbers inline.
 */
export function useSupports(method: string): boolean {
  const bridge = useTmaBridge();
  return useMemo(() => {
    if (bridge.isSupported) return bridge.isSupported(method);
    if (bridge.version) return isMethodSupported(method, bridge.version);
    return true;
  }, [bridge, method]);
}
