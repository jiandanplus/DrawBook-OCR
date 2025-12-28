import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/baidu-api': {
        target: 'https://rbx0gd46k4iacfm7.aistudio-app.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/baidu-api/, ''),
        headers: {
          'Referer': 'https://rbx0gd46k4iacfm7.aistudio-app.com'
        }
      }
    }
  }
})
