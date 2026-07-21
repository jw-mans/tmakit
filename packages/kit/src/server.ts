/**
 * tma-kit/server — server-only auth helpers. Node runtime (uses node:crypto).
 *
 * HARD RULE: never import this from client code — it's the trusted side that holds
 * the bot token. initData validation belongs ONLY here.
 */
export { parseInitData, validateInitData } from './server/initData';
export type {
  InitDataUser,
  ParsedInitData,
  ValidateOptions,
  ValidateResult,
} from './server/initData';

export { signSession, verifySession } from './server/jwt';
export type { SignOptions, VerifyResult } from './server/jwt';

export { expressInitDataAuth, extractInitData } from './server/express';
export type { InitDataAuthOptions } from './server/express';
