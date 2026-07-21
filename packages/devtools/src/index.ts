/**
 * tma-devtools — dev-only mock + interactive panel.
 *
 * HARD RULE: mount ONLY behind `import.meta.env.DEV`, keep in devDependencies.
 * Mock code must never reach production — it's both dead weight and a security hole.
 *
 * Sits on the bridge seam: wraps mockTelegramEnv, logs every postEvent, auto-answers
 * request events so the app never hangs, and emits events into the app from the panel.
 */
export const DEVTOOLS_VERSION = '0.0.0';
