<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <el-tag effect="plain">dsl_type: {{ draft.dsl_type }}</el-tag>
          <el-tag effect="plain">draft_id: {{ draft.draft_id }}</el-tag>
        </div>
        <el-radio-group v-model="graphvizMode" size="small">
          <el-radio-button label="code">代码</el-radio-button>
          <el-radio-button label="preview">预览</el-radio-button>
        </el-radio-group>
      </div>
    </template>

    <div v-if="graphvizMode === 'code'">
      <el-input
        :model-value="graphvizCode"
        type="textarea"
        :rows="16"
        class="code-mono"
        placeholder="Graphviz DOT 代码（M7 Draft.code）"
        readonly
      />
    </div>

    <div v-else class="preview-box">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="color: var(--el-text-color-secondary); font-size: 12px;">
          Graphviz 预览（预留集成 https://graphviz.org/）
        </span>
        <el-button size="small" @click="handleRefreshPreview">刷新预览</el-button>
      </div>
      <div class="graphviz-preview-host" ref="graphvizPreviewRef">
        <el-alert
          title="Graphviz 预览占位"
          type="info"
          :closable="false"
          show-icon
          description="后续将集成 Graphviz 渲染引擎，支持 DOT 语言可视化。"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Props {
  graphvizCode: string
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
  (e: 'update:graphvizMode', value: 'code' | 'preview'): void
}>()

const graphvizMode = ref<'code' | 'preview'>('code')
const graphvizPreviewRef = ref<HTMLElement | null>(null)

const handleRefreshPreview = () => {
  // TODO: 后续集成 Graphviz 渲染
  console.log('Graphviz preview refresh:', props.graphvizCode)
}
</script>

<style scoped>
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

.graphviz-preview-host {
  min-height: 360px;
  overflow: auto;
  background: var(--el-bg-color);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
