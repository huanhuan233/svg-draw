<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <b>SmartMermaid（预留）</b>
        <el-tag type="info" effect="light">未集成</el-tag>
      </div>
    </template>
    <div style="color: var(--el-text-color-regular); line-height: 1.7;">
      这里预留：模板化节点库 / 自动布局 / 交互编辑 / 与 final_spec.scene 双向绑定。
    </div>
    <div style="height: 12px"></div>
    <div class="preview-box" style="color: var(--el-text-color-secondary)">
      SmartMermaid UI 占位
    </div>
  </el-card>
</template>

<script setup lang="ts">
// SmartMermaid 面板占位组件
</script>

<style scoped>
.preview-box {
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  padding: 12px;
  min-height: 360px;
  background: var(--el-fill-color-light);
}
</style>
