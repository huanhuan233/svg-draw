import apiClient from '../utils/api'
import type { SvgDraw, CreateSvgDrawParams, RunResponse } from '../utils/types'

export const svgDrawService = {
  /**
   * 获取 SVG 绘图列表
   */
  getList(): Promise<SvgDraw[]> {
    return apiClient.get('/svg-draws/')
  },

  /**
   * 获取 SVG 绘图详情
   */
  getDetail(id: number): Promise<SvgDraw> {
    return apiClient.get(`/svg-draws/${id}/`)
  },

  /**
   * 创建 SVG 绘图
   */
  create(params: CreateSvgDrawParams): Promise<SvgDraw> {
    return apiClient.post('/svg-draws/', params)
  },

  /**
   * 更新 SVG 绘图
   */
  update(id: number, params: CreateSvgDrawParams): Promise<SvgDraw> {
    return apiClient.put(`/svg-draws/${id}/`, params)
  },

  /**
   * 删除 SVG 绘图
   */
  delete(id: number): Promise<void> {
    return apiClient.delete(`/svg-draws/${id}/`)
  },

  /**
   * 触发全链路编排（M6 Orchestrator）
   * 注意：此接口返回格式可能与标准 API 不同，需要特殊处理
   */
  async runOrchestrator(text: string, outputMode: string = 'auto'): Promise<RunResponse['data']> {
    try {
      // 使用 axios 原始请求，绕过响应拦截器
      const axios = (await import('axios')).default
      const API_BASE_URL = import.meta.env.DEV 
        ? (import.meta.env.VITE_API_URL || 'http://localhost:8626/api')
        : '/api'
      
      const response = await axios.post(`${API_BASE_URL}/orchestrator/run/`, {
        text,
        output_mode: outputMode,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 编排可能需要更长时间
      })
      
      const responseData = response.data
      
      // 处理 { ok: true, data: {...} } 格式
      if (responseData && typeof responseData === 'object' && 'ok' in responseData) {
        if (responseData.ok && responseData.data) {
          return responseData.data
        } else {
          throw new Error(responseData.error || '编排失败')
        }
      }
      
      // 处理 { code: 0, data: {...} } 格式（标准 API 格式）
      if (responseData && typeof responseData === 'object' && 'code' in responseData) {
        if (responseData.code === 0 && responseData.data) {
          return responseData.data
        } else {
          throw new Error(responseData.message || '编排失败')
        }
      }
      
      // 如果响应直接是 data 格式
      if (responseData && typeof responseData === 'object' && 'run_id' in responseData) {
        return responseData
      }
      
      throw new Error('未知的响应格式')
    } catch (error: any) {
      // 处理错误响应
      if (error.response?.data) {
        const data = error.response.data
        if (data.ok === false) {
          throw new Error(data.error || '编排失败')
        }
        if (data.code !== undefined && data.code !== 0) {
          throw new Error(data.message || '编排失败')
        }
      }
      throw error
    }
  },
}
