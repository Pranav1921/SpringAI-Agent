import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4200,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
