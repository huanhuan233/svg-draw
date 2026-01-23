import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 8625,
    proxy: {
      '/api': {
        target: 'http://localhost:8626',
        changeOrigin: true,
      },
    },
  },
})
