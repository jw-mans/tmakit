import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Two entries: client (index) and server-only auth (server, Node crypto).
      entry: { index: 'src/index.ts', server: 'src/server.ts' },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rolldownOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tmakit/core',
        '@tma.js/bridge',
        '@telegram-apps/bridge',
        'node:crypto',
      ],
    },
  },
});
