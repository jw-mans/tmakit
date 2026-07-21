import { validateInitData, type ParsedInitData } from './initData';

/**
 * Connect/Express-style middleware that validates initData and attaches the parsed
 * result as `req.tmaInitData`. Typed against minimal local interfaces so tma-kit
 * doesn't depend on Express.
 */

export interface InitDataAuthOptions {
  botToken: string;
  maxAgeSeconds?: number;
  /** Header to read initData from. Default: 'authorization' (scheme "tma <initData>"). */
  header?: string;
}

interface MinimalRequest {
  headers: Record<string, string | string[] | undefined>;
  tmaInitData?: ParsedInitData;
}

interface MinimalResponse {
  status(code: number): { json(body: unknown): unknown };
}

type NextFunction = (err?: unknown) => void;

/** Extract initData from a header value, supporting the "tma <initData>" scheme. */
export function extractInitData(header: string | string[] | undefined): string | undefined {
  if (!header) return undefined;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return undefined;
  const match = /^tma\s+(.+)$/i.exec(value);
  return match ? match[1] : value;
}

export function expressInitDataAuth(options: InitDataAuthOptions) {
  const headerName = (options.header ?? 'authorization').toLowerCase();

  return function initDataAuth(req: MinimalRequest, res: MinimalResponse, next: NextFunction): void {
    const raw = extractInitData(req.headers[headerName]);
    if (!raw) {
      res.status(401).json({ error: 'missing_init_data' });
      return;
    }
    const result = validateInitData(raw, options.botToken, { maxAgeSeconds: options.maxAgeSeconds });
    if (!result.ok) {
      res.status(401).json({ error: result.error });
      return;
    }
    req.tmaInitData = result.data;
    next();
  };
}
