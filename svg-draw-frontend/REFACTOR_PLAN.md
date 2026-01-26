# 重构改动清单

## 1. 改动清单

### 1.1 修改的文件
- `src/utils/types.ts` - 补充后端响应类型定义
- `src/services/svgDrawService.ts` - 添加 orchestrator/run 接口调用
- `src/composables/useSvgDraw.ts` - 完全重构为核心业务逻辑 composable
- `src/components/SvgChatPanel.vue` - 重构为左侧聊天面板（对齐原型）
- `src/components/SvgEditorPane.vue` - 重构为右侧编辑器面板（Tabs + 各面板）
- `src/pages/SvgDrawWorkspace.vue` - 重构为主页面布局（Header + 左右布局 + Drawer）

### 1.2 新建的文件
- `src/components/mermaid/MermaidPanel.vue` - Mermaid 代码面板
- `src/components/mermaid/SmartMermaidPanel.vue` - SmartMermaid 面板（占位）
- `src/components/svgedit/SvgEditPanel.vue` - SVG-Edit iframe 面板
- `src/components/debug/LogsPanel.vue` - Logs 面板
- `src/components/RunDraftDrawer.vue` - 右侧抽屉（运行与草稿）

### 1.3 保持不变的文件
- `src/components/svg/SvgCodeEditor.vue` - 复用
- `src/components/svg/SvgPreview.vue` - 复用
- `src/components/svg/SvgGenPanel.vue` - 可能不再需要，但保留
- `src/utils/api.ts` - 保持现有 axios 配置

## 2. 数据流/事件流简图

```
用户输入
  ↓
SvgChatPanel (emit: 'send', text)
  ↓
useSvgDraw.sendPrompt(text)
  ↓
svgDrawService.runOrchestrator({ text, output_mode: 'auto' })
  ↓
后端 API: POST /api/orchestrator/run/
  ↓
响应: { ok: true, data: { run_id, status, draft_id, draft: { dsl_type, code, meta }, final_spec } }
  ↓
useSvgDraw.applyResponse(data)
  ↓
更新状态:
  - messages (追加 AI 回复)
  - run (run_id, status)
  - draft (draft_id, dsl_type, code, title, router_reason)
  - svgCode / mermaidCode (根据 dsl_type)
  - finalSpecJson / ragJson
  - logs (追加日志行)
  ↓
自动切换 Tab (如果 autoSwitch 开启):
  - dsl_type === 'svg' → activeTab = 'svg'
  - dsl_type === 'mermaid' → activeTab = 'mermaid'
  - dsl_type === 'smartmermaid' → activeTab = 'smart'
  ↓
SvgEditorPane 根据 activeTab 显示对应面板:
  - 'svg' → SVG 面板 (code/preview 切换)
  - 'mermaid' → MermaidPanel
  - 'smart' → SmartMermaidPanel
  - 'svgedit' → SvgEditPanel (iframe)
  - 'kg' → finalSpecJson 显示
  - 'rag' → ragJson 显示
  - 'logs' → LogsPanel
```

## 3. 状态管理（useSvgDraw.ts）

核心状态：
- messages: ChatMessage[] - 聊天消息列表
- prompt: string - 当前输入
- run: { run_id, status }
- draft: { draft_id, dsl_type, code, title, router_reason }
- svgCode: string
- mermaidCode: string
- finalSpecJson: string
- ragJson: string
- logs: string
- activeTab: 'svg' | 'mermaid' | 'smart' | 'svgedit' | 'kg' | 'rag' | 'logs'
- svgMode: 'code' | 'preview'
- autoSwitch: boolean
- leftWidth: number (320-720)
- drawerOpen: boolean
- isDark: boolean

核心方法：
- sendPrompt(text: string): Promise<void>
- applyResponse(data: RunResponse): void
- copyCurrentCode(): Promise<void>
- pushToSvgEdit(): void
- toggleTheme(): void
- toggleDrawer(): void
- startResize(e: MouseEvent): void
