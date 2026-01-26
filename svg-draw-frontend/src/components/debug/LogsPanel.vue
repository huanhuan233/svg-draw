<template>
  <el-card shadow="never">
    <template #header>
      <b>M1 | RunStepLog（占位）</b>
    </template>
    <el-input
      :model-value="logsText"
      type="textarea"
      :rows="18"
      class="code-mono"
      placeholder="RunStepLog..."
      readonly
    />
  </el-card>
</template>

<script setup lang="ts">
interface Props {
  logsText: string
}

defineProps<Props>()
</script>

<style scoped>
.code-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
}
</style>
