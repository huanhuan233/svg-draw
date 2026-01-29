<template>
  <div class="shell">
    <div class="workspace">
      <!-- 右侧抽屉把手 -->
      <div
        class="drawer-handle"
        @click="handleToggleDrawer"
        :title="drawerOpen ? '关闭侧栏' : '打开侧栏'"
      >
        <span class="v">{{ drawerOpen ? '关闭' : '运行' }}</span>
      </div>

      <div class="header">
        <div class="brand">
          <el-tag type="success" effect="light">就绪</el-tag>
          <span>SVG Draw</span>
        </div>

        <div class="header-actions">
          <el-button type="primary">新建</el-button>
          <el-button>Runs</el-button>
        </div>
      </div>

      <div class="main">
        <!-- 左侧：对话 -->
        <aside class="left" :style="{ width: leftWidth + 'px' }">
          <SvgChatPanel
            :messages="messages"
            :prompt="prompt"
            :run="run"
            :draft="draft"
            :left-mode="leftMode"
            @update:prompt="handleUpdatePrompt"
            @update:left-mode="handleUpdateLeftMode"
            @send="handleSend"
            @example="handleExample"
            @push="handlePushToSvgEdit"
          />
        </aside>

        <!-- Resizer for left panel -->
        <div class="resizer" @mousedown="handleStartResize"></div>

        <!-- 右侧：编辑器 -->
        <section class="right">
          <SvgEditorPane
            :active-tab="activeTab"
            :svg-mode="svgMode"
            :auto-switch="autoSwitch"
            :svg-code="svgCode"
            :graphviz-code="graphvizCode"
            :mermaid-code="mermaidCode"
            :final-spec-json="finalSpecJson"
            :rag-json="ragJson"
            :logs-text="logsText"
            :draft="draft"
            :can-push="canPushToSvgEdit"
            @update:active-tab="handleUpdateActiveTab"
            @update:svg-mode="handleUpdateSvgMode"
            @update:auto-switch="handleUpdateAutoSwitch"
            @copy="handleCopyCode"
            @push="handlePushToSvgEdit"
          />
        </section>
      </div>

      <!-- 抽屉：运行与草稿 -->
      <RunDraftDrawer
        :drawer-open="drawerOpen"
        :run="run"
        :draft="draft"
        @update:drawer-open="handleUpdateDrawerOpen"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSvgDraw } from '../composables/useSvgDraw'
import SvgChatPanel from '../components/SvgChatPanel.vue'
import SvgEditorPane from '../components/SvgEditorPane.vue'
import RunDraftDrawer from '../components/RunDraftDrawer.vue'
import type { ActiveTab, SvgMode } from '../composables/useSvgDraw'

const {
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
  canPushToSvgEdit,
  
  // 方法
  toggleDrawer,
  startResize,
  sendPrompt,
  copyCurrentCode,
  pushToSvgEdit,
  loadExample,
} = useSvgDraw()

const handleToggleDrawer = () => {
  toggleDrawer()
}

const handleUpdateDrawerOpen = (value: boolean) => {
  drawerOpen.value = value
}

const handleStartResize = (e: MouseEvent) => {
  startResize(e)
}

const handleUpdatePrompt = (value: string) => {
  prompt.value = value
}

const handleUpdateLeftMode = (value: 'chat' | 'history') => {
  leftMode.value = value
}

const handleSend = (text: string) => {
  sendPrompt(text)
}

const handleExample = () => {
  loadExample()
}

const handleUpdateActiveTab = (value: ActiveTab) => {
  activeTab.value = value
}

const handleUpdateSvgMode = (value: SvgMode) => {
  svgMode.value = value
}

const handleUpdateAutoSwitch = (value: boolean) => {
  autoSwitch.value = value
}

const handleCopyCode = () => {
  copyCurrentCode()
}

const handlePushToSvgEdit = () => {
  pushToSvgEdit()
}
</script>

<style scoped>
.shell {
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}

.workspace {
  height: calc(100vh - 24px);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--el-text-color-primary);
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.main {
  flex: 1;
  min-height: 0;
  display: flex;
}

.left {
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.resizer {
  width: 4px;
  background: var(--el-border-color);
  cursor: col-resize;
  user-select: none;
}

.resizer:hover {
  background: var(--el-color-primary);
}

.right {
  flex: 1;
  min-width: 520px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

/* 右侧抽屉把手：始终贴右边缘，中间位置 */
.drawer-handle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 50;
  width: 34px;
  height: 64px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  color: var(--el-text-color-regular);
}

.drawer-handle:hover {
  border-color: var(--el-color-primary-light-5);
}

.drawer-handle .v {
  writing-mode: vertical-rl;
  letter-spacing: 1px;
  font-size: 12px;
  line-height: 1;
}

@media (max-width: 900px) {
  .main {
    flex-direction: column;
  }
  
  .left {
    width: 100%;
    max-width: none;
    border-right: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  
  .right {
    min-width: 0;
  }
  
  .resizer {
    display: none;
  }
  
  .drawer-handle {
    display: none;
  }
}
</style>
