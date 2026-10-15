import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // GEMINI_API_KEY is deliberately not exposed to the browser bundle; only server.ts uses it.
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        // data/ is the LGD snapshot written by `npm run lgd:sync`; it is read by the server, not
        // the browser bundle, so writing it must not trigger page reloads.
        ignored: ['**/.sf/**', '**/data/**', '**/scripts/**', '**/*.log'],
      },
    },
  };
});
