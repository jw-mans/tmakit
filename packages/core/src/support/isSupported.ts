import { METHOD_MIN_VERSION } from './versionMap';

/**
 * Compare two dotted versions numerically. "7.10" > "7.2" (segments are numbers,
 * not strings). Returns -1 / 0 / 1.
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.');
  const pb = b.split('.');
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = Number(pa[i] ?? 0);
    const y = Number(pb[i] ?? 0);
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

/**
 * Whether a method is supported at the given client version, per the version map.
 * Unknown (ungated) methods are assumed supported. This is the fallback — at runtime
 * prefer the SDK's own `isSupported`/`supports`.
 */
export function isMethodSupported(
  method: string,
  version: string,
  map: Readonly<Record<string, string>> = METHOD_MIN_VERSION,
): boolean {
  const min = map[method];
  if (!min) return true;
  return compareVersions(version, min) >= 0;
}
