<template>
  <div class="svg-editor-pane">
    <div class="right-top">
      <el-tabs v-model="activeTab" type="card" style="flex: 1;">
        <el-tab-pane label="Graphviz" name="graphviz" />
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
      <div class="editor-main" :class="{ 'svgedit-active': activeTab === 'svgedit' }">
        <!-- Graphviz -->
        <template v-if="activeTab === 'graphviz'">
          <GraphvizPanel
            :graphviz-code="graphvizCode"
            :draft="draft"
            @update:graphviz-mode="handleUpdateGraphvizMode"
          />
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
import GraphvizPanel from './graphviz/GraphvizPanel.vue'
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
  graphvizCode: string
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

const handleUpdateGraphvizMode = (value: 'code' | 'preview') => {
  // Graphviz 模式切换处理（如果需要）
  console.log('Graphviz mode:', value)
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
  display: flex;
  flex-direction: column;
}

/* SVG-Edit 面板时，editor-main 不滚动，让 iframe 占据空间 */
.editor-main.svgedit-active {
  overflow: hidden;
  padding: 0;
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
</style>
