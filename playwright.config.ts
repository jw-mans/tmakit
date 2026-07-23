import { defineConfig } from '@playwright/test';

const PORT = 5199;
const BASE_URL = `http://localhost:${PORT}`;

// E2E against the playground dev server. The mock lives in the page (dev exposes it on
// window.__tmakit_mock__); specs drive it via createTmaPageDriver — no real Telegram.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run dev -w playground -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
