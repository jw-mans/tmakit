import { defineConfig } from 'vite';

// Library build. .d.ts generation wired up later (M1) once real types land.
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rolldownOptions: {
      // Bridges are optional peers — never bundle them.
      external: ['@tma.js/bridge', '@telegram-apps/bridge'],
    },
  },
});
