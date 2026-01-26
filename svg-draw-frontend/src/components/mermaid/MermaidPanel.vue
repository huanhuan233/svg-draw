<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <b>Mermaid（预留渲染）</b>
        <span style="color: var(--el-text-color-secondary); font-size: 12px;">
          后续接 SmartMermaid 或 mermaid.js
        </span>
      </div>
    </template>
    <el-input
      :model-value="mermaidCode"
      type="textarea"
      :rows="16"
      class="code-mono"
      placeholder="Mermaid 代码（M7 Draft.code）"
      readonly
    />
    <div style="height: 12px"></div>
    <div class="preview-box" style="color: var(--el-text-color-secondary)">
      Mermaid 预览占位
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  mermaidCode: string
}

defineProps<Props>()
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
</style>
