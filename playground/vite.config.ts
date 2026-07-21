import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// https://vite.dev/config/
// Alias the workspace packages to their TS source so the playground gets instant
// HMR without rebuilding the libraries.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tmakit/core': resolve(import.meta.dirname, '../packages/core/src/index.ts'),
      'tma-kit': resolve(import.meta.dirname, '../packages/kit/src/index.ts'),
      'tma-devtools': resolve(import.meta.dirname, '../packages/devtools/src/index.ts'),
    },
  },
});
