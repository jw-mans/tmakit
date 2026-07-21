import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Server-side initData validation. NEVER run this on the client — the bot token is a
 * secret and the client is not a trusted party.
 */

export interface InitDataUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  [key: string]: unknown;
}

export interface ParsedInitData {
  /** The original raw query string. */
  raw: string;
  /** auth_date in seconds since epoch. */
  authDate: number;
  hash: string;
  signature?: string;
  queryId?: string;
  user?: InitDataUser;
  receiver?: InitDataUser;
  startParam?: string;
  chatType?: string;
  chatInstance?: string;
  canSendAfter?: number;
}

function safeJson<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

/** Parse a raw initData query string into a typed object (no validation). */
export function parseInitData(raw: string): ParsedInitData {
  const p = new URLSearchParams(raw);
  const canSendAfter = p.get('can_send_after');
  return {
    raw,
    authDate: Number(p.get('auth_date') ?? 0),
    hash: p.get('hash') ?? '',
    signature: p.get('signature') ?? undefined,
    queryId: p.get('query_id') ?? undefined,
    user: safeJson<InitDataUser>(p.get('user')),
    receiver: safeJson<InitDataUser>(p.get('receiver')),
    startParam: p.get('start_param') ?? undefined,
    chatType: p.get('chat_type') ?? undefined,
    chatInstance: p.get('chat_instance') ?? undefined,
    canSendAfter: canSendAfter != null ? Number(canSendAfter) : undefined,
  };
}

export interface ValidateOptions {
  /** Reject initData older than this many seconds (recommended). */
  maxAgeSeconds?: number;
  /** Clock injection for tests. Returns ms since epoch. */
  now?: () => number;
}

export type ValidateResult =
  | { ok: true; data: ParsedInitData }
  | { ok: false; error: 'missing_hash' | 'invalid_hash' | 'expired' };

/**
 * Verify initData against the bot token (HMAC-SHA256) and optionally its freshness.
 *
 * secret = HMAC_SHA256(key="WebAppData", msg=botToken)
 * hash   = HMAC_SHA256(key=secret, msg=data_check_string)
 * where data_check_string is every field except `hash`, sorted by key, joined by "\n".
 */
export function validateInitData(
  raw: string,
  botToken: string,
  options: ValidateOptions = {},
): ValidateResult {
  const p = new URLSearchParams(raw);
  const hash = p.get('hash');
  if (!hash) return { ok: false, error: 'missing_hash' };

  const pairs: Array<[string, string]> = [];
  for (const [key, value] of p) {
    if (key === 'hash') continue;
    pairs.push([key, value]);
  }
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');

  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computed = createHmac('sha256', secret).update(dataCheckString).digest('hex');

  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: 'invalid_hash' };
  }

  if (options.maxAgeSeconds != null) {
    const authDate = Number(p.get('auth_date') ?? 0);
    const nowSeconds = (options.now ? options.now() : Date.now()) / 1000;
    if (nowSeconds - authDate > options.maxAgeSeconds) {
      return { ok: false, error: 'expired' };
    }
  }

  return { ok: true, data: parseInitData(raw) };
}
