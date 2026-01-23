import apiClient from '../utils/api'
import type { SvgDraw, CreateSvgDrawParams } from '../utils/types'

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
}
