import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const src = (p: string) => resolve(import.meta.dirname, p);

// Tests run against package sources (aliased), on the jsdom DOM.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tmakit/core': src('packages/core/src/index.ts'),
      '@tmakit/testing': src('packages/testing/src/index.ts'),
      'tma-kit': src('packages/kit/src/index.ts'),
      'tma-devtools': src('packages/devtools/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['packages/**/test/**/*.test.{ts,tsx}'],
  },
});
