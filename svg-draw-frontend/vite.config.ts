import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 从环境变量读取配置，如果没有则使用默认值
const FRONTEND_PORT = parseInt(process.env.VITE_FRONTEND_PORT || '8625', 10)
const FRONTEND_HOST = process.env.VITE_FRONTEND_HOST || '0.0.0.0'
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8626'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: FRONTEND_HOST,
    port: FRONTEND_PORT,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
})
