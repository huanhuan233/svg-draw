import axios from 'axios'

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8626/api'  // 开发环境
  : '/api'  // 生产环境

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器 - 统一处理响应格式
apiClient.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 0) {
      return Promise.resolve(data)
    } else {
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
