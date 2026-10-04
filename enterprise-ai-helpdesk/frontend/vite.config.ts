import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Increase timeout — uvicorn worker takes a few seconds to load ML models on first boot.
        // Default Vite proxy timeout is too short and causes ETIMEDOUT on cold start.
        proxyTimeout: 30000,
        timeout: 30000,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.warn('[proxy] Backend not reachable:', err.message);
          });
        },
      },
    },
  },
});
