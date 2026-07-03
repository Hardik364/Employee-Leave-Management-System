import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration. Dev server proxies /api to the backend so the
// frontend can call relative URLs during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
