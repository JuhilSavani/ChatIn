import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    https: false,
    open: true, // Open the browser on server start
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', 
      },
    },
  },
});