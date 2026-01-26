<template>
  <div class="svg-editor-pane">
    <div class="right-top">
      <el-tabs v-model="activeTab" type="card" style="flex: 1;">
        <el-tab-pane label="SVG" name="svg" />
        <el-tab-pane label="Mermaid" name="mermaid" />
        <el-tab-pane label="SmartMermaid" name="smart" />
        <el-tab-pane label="SVG-Edit" name="svgedit" />
        <el-tab-pane label="KG" name="kg" />
        <el-tab-pane label="RAG" name="rag" />
        <el-tab-pane label="Logs" name="logs" />
      </el-tabs>

      <div class="toolbar">
        <el-button
          @click="handleToggleAuto"
          :type="autoSwitch ? 'primary' : 'default'"
        >
          {{ autoSwitch ? '自动切换' : '手动切换' }}
        </el-button>
        <el-button @click="handleCopyCode">复制代码</el-button>
        <el-button type="primary" @click="handlePush">推送</el-button>
      </div>
    </div>

    <div class="editor-area">
      <div class="editor-main">
        <!-- SVG -->
        <template v-if="activeTab === 'svg'">
          <el-card shadow="never">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <el-tag effect="plain">dsl_type: {{ draft.dsl_type }}</el-tag>
                  <el-tag effect="plain">draft_id: {{ draft.draft_id }}</el-tag>
                </div>
                <el-radio-group v-model="svgMode" size="small">
                  <el-radio-button label="code">代码</el-radio-button>
                  <el-radio-button label="preview">预览</el-radio-button>
                </el-radio-group>
              </div>
            </template>

            <div v-if="svgMode === 'code'">
              <SvgCodeEditor
                :model-value="svgCode"
                :rows="16"
              />
            </div>

            <div v-else class="preview-box">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="color: var(--el-text-color-secondary); font-size: 12px;">
                  SVG 预览（prototype）
                </span>
                <el-button size="small" @click="handleRefreshPreview">刷新预览</el-button>
              </div>
              <div class="svg-preview-host" ref="svgPreviewRef"></div>
            </div>
          </el-card>
        </template>

        <!-- Mermaid -->
        <template v-else-if="activeTab === 'mermaid'">
          <MermaidPanel :mermaid-code="mermaidCode" />
        </template>

        <!-- SmartMermaid -->
        <template v-else-if="activeTab === 'smart'">
          <SmartMermaidPanel />
        </template>

        <!-- SVG-Edit -->
        <template v-else-if="activeTab === 'svgedit'">
          <SvgEditPanel />
        </template>

        <!-- KG -->
        <template v-else-if="activeTab === 'kg'">
          <el-card shadow="never">
            <template #header>
              <b>M4 | Knowledge Graph（Stub）</b>
            </template>
            <el-input
              :model-value="finalSpecJson"
              type="textarea"
              :rows="18"
              class="code-mono"
              placeholder="final_spec JSON"
              readonly
            />
          </el-card>
        </template>

        <!-- RAG -->
        <template v-else-if="activeTab === 'rag'">
          <el-card shadow="never">
            <template #header>
              <b>M5 | RAG（Stub）</b>
            </template>
            <el-input
              :model-value="ragJson"
              type="textarea"
              :rows="18"
              class="code-mono"
              placeholder="citations / retrieval traces"
              readonly
            />
          </el-card>
        </template>

        <!-- Logs -->
        <template v-else-if="activeTab === 'logs'">
          <LogsPanel :logs-text="logsText" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import SvgCodeEditor from './svg/SvgCodeEditor.vue'
import MermaidPanel from './mermaid/MermaidPanel.vue'
import SmartMermaidPanel from './mermaid/SmartMermaidPanel.vue'
import SvgEditPanel from './svgedit/SvgEditPanel.vue'
import LogsPanel from './debug/LogsPanel.vue'
import type { ActiveTab, SvgMode } from '../composables/useSvgDraw'

interface Props {
  activeTab: ActiveTab
  svgMode: SvgMode
  autoSwitch: boolean
  svgCode: string
  mermaidCode: string
  finalSpecJson: string
  ragJson: string
  logsText: string
  draft: {
    draft_id: string
    dsl_type: string
    title: string
    router_reason: string
    code: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:activeTab', value: ActiveTab): void
  (e: 'update:svgMode', value: SvgMode): void
  (e: 'update:autoSwitch', value: boolean): void
  (e: 'copy'): void
  (e: 'push'): void
}>()

const svgPreviewRef = ref<HTMLElement | null>(null)

const activeTab = ref(props.activeTab)
const svgMode = ref(props.svgMode)
const autoSwitch = ref(props.autoSwitch)

watch(() => props.activeTab, (val) => {
  activeTab.value = val
})

watch(() => props.svgMode, (val) => {
  svgMode.value = val
})

watch(() => props.autoSwitch, (val) => {
  autoSwitch.value = val
})

watch(activeTab, (val) => {
  emit('update:activeTab', val)
})

watch(svgMode, (val) => {
  emit('update:svgMode', val)
})

watch(autoSwitch, (val) => {
  emit('update:autoSwitch', val)
})

// 监听 svgCode 变化，自动更新预览
watch(() => props.svgCode, () => {
  if (activeTab.value === 'svg' && svgMode.value === 'preview') {
    nextTick(() => {
      renderSvg(props.svgCode)
    })
  }
})

// 监听 svgMode 变化，切换时渲染预览
watch(svgMode, (val) => {
  if (val === 'preview' && activeTab.value === 'svg') {
    nextTick(() => {
      renderSvg(props.svgCode)
    })
  }
})

const renderSvg = (svgText: string) => {
  const host = svgPreviewRef.value
  if (!host) return
  
  host.innerHTML = ''
  try {
    host.innerHTML = svgText || '<div style="color: var(--el-text-color-secondary)">空 SVG</div>'
  } catch (e) {
    host.innerHTML = `<div style="color: var(--el-color-danger)">SVG 渲染失败：${String(e)}</div>`
  }
}

const handleRefreshPreview = () => {
  renderSvg(props.svgCode)
}

const handleToggleAuto = () => {
  autoSwitch.value = !autoSwitch.value
}

const handleCopyCode = () => {
  emit('copy')
}

const handlePush = () => {
  emit('push')
}
</script>

<style scoped>
.svg-editor-pane {
  flex: 1;
  min-width: 520px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
}

.right-top {
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--el-bg-color);
}

.toolbar {
  display: flex;
  gap: 8px;
}

.editor-area {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.editor-main {
  flex: 1;
  min-width: 0;
  padding: 12px;
  overflow: auto;
  background: var(--el-bg-color);
}

.code-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
}

.preview-box {
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  min-height: 360px;
  background: var(--el-fill-color-light);
}

.svg-preview-host {
  min-height: 360px;
  overflow: auto;
  background: var(--el-bg-color);
  border-radius: 10px;
}
</style>
