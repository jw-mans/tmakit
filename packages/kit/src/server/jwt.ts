import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Minimal HS256 session tokens for the initData -> JWT exchange. Dependency-free and
 * deliberately small — swap for a full JWT library if you need more (audiences,
 * key rotation, etc.). Keep the secret server-side.
 */

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function encodeSegment(obj: Record<string, unknown>): string {
  return b64url(Buffer.from(JSON.stringify(obj)));
}

export interface SignOptions {
  /** Token lifetime in seconds; adds an `exp` claim. */
  expiresInSeconds?: number;
  now?: () => number;
}

export function signSession(
  payload: Record<string, unknown>,
  secret: string,
  options: SignOptions = {},
): string {
  const nowSeconds = Math.floor((options.now ? options.now() : Date.now()) / 1000);
  const body: Record<string, unknown> = { ...payload, iat: nowSeconds };
  if (options.expiresInSeconds != null) body.exp = nowSeconds + options.expiresInSeconds;

  const head = encodeSegment({ alg: 'HS256', typ: 'JWT' });
  const pay = encodeSegment(body);
  const sig = b64url(createHmac('sha256', secret).update(`${head}.${pay}`).digest());
  return `${head}.${pay}.${sig}`;
}

export type VerifyResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; error: 'malformed' | 'bad_signature' | 'expired' };

export function verifySession(
  token: string,
  secret: string,
  options: { now?: () => number } = {},
): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, error: 'malformed' };
  const [head, pay, sig] = parts as [string, string, string];

  const expected = createHmac('sha256', secret).update(`${head}.${pay}`).digest();
  const given = Buffer.from(sig, 'base64url');
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return { ok: false, error: 'bad_signature' };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(pay, 'base64url').toString());
  } catch {
    return { ok: false, error: 'malformed' };
  }

  const nowSeconds = Math.floor((options.now ? options.now() : Date.now()) / 1000);
  if (typeof payload.exp === 'number' && nowSeconds > payload.exp) {
    return { ok: false, error: 'expired' };
  }
  return { ok: true, payload };
}
