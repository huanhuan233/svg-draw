import { ref, reactive, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { svgDrawService } from '../services/svgDrawService'
import type { ChatMessage, RunResponse, DslType } from '../utils/types'

export type ActiveTab = 'graphviz' | 'mermaid' | 'smart' | 'svgedit' | 'kg' | 'rag' | 'logs'
export type SvgMode = 'code' | 'preview'

export function useSvgDraw() {
  // ========== UI 状态 ==========
  const leftMode = ref<'chat' | 'history'>('chat')
  const activeTab = ref<ActiveTab>('graphviz')
  const svgMode = ref<SvgMode>('code')
  const autoSwitch = ref(true)
  const drawerOpen = ref(false)
  const leftWidth = ref(360)

  // ========== 数据状态 ==========
  const messages = ref<ChatMessage[]>([
    {
      role: 'ai',
      text: `默认白底（Element UI 风格）。
右侧"运行与草稿"已默认收起：点右边小把手可展开。
左侧对话栏可调节宽度。

输入一句话后：M2→M6→M7，按 draft.dsl_type 自动切面板。
（SmartMermaid / KG / RAG / Logs 均已留好占位）`,
    },
  ])
  const prompt = ref('')

  const run = reactive({
    run_id: '-',
    status: '-',
  })

  const draft = reactive({
    draft_id: '-',
    dsl_type: 'svg' as DslType,
    title: '-',
    router_reason: '-',
    code: '',
  })

  const svgCode = ref('')
  const graphvizCode = ref('')
  const mermaidCode = ref('')
  const finalSpecJson = ref('')
  const ragJson = ref('')
  const logsText = ref('')

  // ========== 抽屉 ==========
  const toggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value
  }

  // ========== 左侧宽度拖拽 ==========
  const startResize = (e: MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = leftWidth.value

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX
      leftWidth.value = Math.max(320, Math.min(720, startWidth + delta))
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // ========== 自动切换 Tab ==========
  const autoSwitchByDsl = (dslType: DslType) => {
    if (!autoSwitch.value) return

    // 后端可能返回 'svg' 或 'graphviz'，都映射到 'graphviz' 标签页
    if (dslType === 'svg' || dslType === 'graphviz') {
      activeTab.value = 'graphviz'
    } else if (dslType === 'mermaid') {
      activeTab.value = 'mermaid'
    } else if (dslType === 'smartmermaid') {
      activeTab.value = 'smart'
    } else {
      activeTab.value = 'graphviz'
    }
  }

  // ========== 应用响应数据 ==========
  const applyResponse = (data: RunResponse['data']) => {
    if (!data) return

    // 更新 run
    run.run_id = data.run_id ?? '-'
    run.status = data.status ?? '-'

    // 更新 draft
    const d = data.draft ?? {}
    draft.draft_id = String(data.draft_id ?? d.id ?? '-')
    draft.dsl_type = (d.dsl_type ?? 'svg') as DslType
    draft.title = d.meta?.title ?? '-'
    draft.router_reason = d.meta?.router_reason ?? '-'
    draft.code = d.code ?? ''

    // 根据 dsl_type 更新代码
    // 后端可能返回 'svg' 或 'graphviz'，都作为 Graphviz 处理
    if (draft.dsl_type === 'svg' || draft.dsl_type === 'graphviz') {
      graphvizCode.value = draft.code
      svgCode.value = draft.code // 保留 svgCode 用于向后兼容
      mermaidCode.value = ''
    } else if (draft.dsl_type === 'mermaid') {
      mermaidCode.value = draft.code
      svgCode.value = ''
      graphvizCode.value = ''
    } else {
      graphvizCode.value = draft.code
      svgCode.value = draft.code
      mermaidCode.value = ''
    }

    // 更新 final_spec 和 citations
    const finalSpec = data.final_spec ?? {}
    finalSpecJson.value = JSON.stringify(finalSpec, null, 2)
    ragJson.value = JSON.stringify(finalSpec.citations ?? [], null, 2)

    // 追加日志
    const line = `[${new Date().toLocaleTimeString()}] run=${run.run_id} status=${run.status} dsl=${draft.dsl_type}`
    logsText.value = (logsText.value + '\n' + line).trim()

    // 自动切换 Tab
    autoSwitchByDsl(draft.dsl_type)
  }

  // ========== 发送提示词 ==========
  const sendPrompt = async (text: string) => {
    const trimmedText = (text || '').trim()
    if (!trimmedText) return

    // 追加用户消息
    messages.value.push({
      role: 'user',
      text: trimmedText,
    })
    prompt.value = ''
    
    // 滚动到底部
    await nextTick()
    scrollChatToBottom()

    // 追加 AI 占位消息
    messages.value.push({
      role: 'ai',
      text: '已收到，正在编排生成…（M6）',
    })
    await nextTick()
    scrollChatToBottom()

    try {
      // 调用编排接口
      const data = await svgDrawService.runOrchestrator(trimmedText, 'auto')
      
      // 更新 AI 消息
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.role === 'ai') {
        const draftTitle = data?.draft?.meta?.title || '-'
        const dslType = data?.draft?.dsl_type || '-'
        const draftId = data?.draft_id || '-'
        const runId = data?.run_id || '-'
        
        lastMessage.text = `生成完成：${draftTitle}
- dsl_type: ${dslType}
- draft_id: ${draftId}
- run_id: ${runId}`
      }
      
      // 应用响应数据
      applyResponse(data)
      
      await nextTick()
      scrollChatToBottom()
    } catch (error: any) {
      // 更新错误消息
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.role === 'ai') {
        lastMessage.text = `生成失败：${error.message || String(error)}`
      }
      ElMessage.error(error.message || '生成失败')
      
      await nextTick()
      scrollChatToBottom()
    }
  }

  // ========== 滚动聊天到底部 ==========
  const scrollChatToBottom = () => {
    nextTick(() => {
      const chatBody = document.getElementById('chatBody')
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight
      }
    })
  }

  // ========== 复制代码 ==========
  const copyCurrentCode = async () => {
    let txt = ''
    if (activeTab.value === 'mermaid') {
      txt = mermaidCode.value || ''
    } else if (activeTab.value === 'graphviz') {
      txt = graphvizCode.value || ''
    } else {
      txt = svgCode.value || ''
    }
    
    if (!txt) {
      ElMessage.warning('代码为空')
      return
    }

    try {
      await navigator.clipboard.writeText(txt)
      ElMessage.success('已复制')
    } catch (e) {
      ElMessage.error('复制失败：' + String(e))
    }
  }

  // ========== 推送到 SVG-Edit ==========
  const pushToSvgEdit = () => {
    // 切换到 svgedit tab
    activeTab.value = 'svgedit'
    
    // 等待 tab 切换完成后再推送
    nextTick(() => {
      const frame = document.getElementById('svgeditFrame') as HTMLIFrameElement
      if (!frame || !frame.contentWindow) {
        ElMessage.warning('SVG-Edit 未就绪')
        return
      }

      const svg = svgCode.value || ''
      if (!svg) {
        ElMessage.warning('SVG 代码为空')
        return
      }

      try {
        // 使用 postMessage 推送
        frame.contentWindow.postMessage(
          {
            type: 'IMPORT_SVG',
            svg: svg,
          },
          '*'
        )
        ElMessage.success('已推送到 SVG-Edit')
      } catch (e) {
        ElMessage.error('推送失败：' + String(e))
      }
    })
  }

  // ========== 示例 ==========
  const loadExample = () => {
    prompt.value = '创建一个流程图'
  }

  return {
    // UI 状态
    leftMode,
    activeTab,
    svgMode,
    autoSwitch,
    drawerOpen,
    leftWidth,
    
    // 数据状态
    messages,
    prompt,
    run,
    draft,
    svgCode,
    graphvizCode,
    mermaidCode,
    finalSpecJson,
    ragJson,
    logsText,
    
    // 方法
    toggleDrawer,
    startResize,
    sendPrompt,
    copyCurrentCode,
    pushToSvgEdit,
    loadExample,
  }
}
