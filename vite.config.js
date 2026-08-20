import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.jsx'],
      refresh: true,
      // مهم: specify build path لـ public
      buildDirectory: 'public/build',
    }),
    react(),
  ],
  server: {
    host: '127.0.0.1',  // localhost فقط
    port: 5173,
    strictPort: true,
    cors: true,
  },
})