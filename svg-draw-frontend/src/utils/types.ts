export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface SvgDraw {
  id: number
  name: string
  svg_content: string
  created_at: string
  updated_at: string
}

export interface CreateSvgDrawParams {
  name: string
  svg_content: string
}
