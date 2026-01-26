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

// ========== 后端响应类型（与后端契约保持一致） ==========

export type DslType = 'svg' | 'mermaid' | 'smartmermaid'

export interface DraftMeta {
  title?: string
  router_reason?: string
  [key: string]: any
}

export interface Draft {
  id?: string
  dsl_type: DslType
  code: string
  meta?: DraftMeta
}

export interface Citation {
  source?: string
  content?: string
  [key: string]: any
}

export interface FinalSpec {
  citations?: Citation[]
  scene?: any
  [key: string]: any
}

export interface RunResponse {
  ok: boolean
  error?: string
  data?: {
    run_id: string
    status: string
    draft_id?: string
    draft?: Draft
    final_spec?: FinalSpec
  }
}

export interface ChatMessage {
  role: 'user' | 'ai' | 'system'
  text: string
}
