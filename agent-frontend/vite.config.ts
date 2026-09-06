import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4200,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        secure: false
      },
      '/oauth2': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        secure: false
      },
      '/login/oauth2': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
