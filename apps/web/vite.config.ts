import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('index.html', import.meta.url)),
        app: fileURLToPath(new URL('app.html', import.meta.url)),
        'demo-modern': fileURLToPath(new URL('demo-modern.html', import.meta.url)),
        'test-demo': fileURLToPath(new URL('test-demo.html', import.meta.url)),
        'direct-test': fileURLToPath(new URL('direct-test.html', import.meta.url)),
      },
    },
  },
});
