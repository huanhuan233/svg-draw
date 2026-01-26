<template>
  <el-drawer
    :model-value="drawerOpen"
    direction="rtl"
    size="380px"
    :with-header="true"
    append-to-body
    @update:model-value="handleUpdate"
  >
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <b>运行与草稿</b>
        <el-button size="small" text @click="handleClose">关闭</el-button>
      </div>
    </template>

    <el-descriptions :column="1" border size="small">
      <el-descriptions-item label="run_id">{{ run.run_id }}</el-descriptions-item>
      <el-descriptions-item label="status">{{ run.status }}</el-descriptions-item>
      <el-descriptions-item label="router_reason">{{ draft.router_reason }}</el-descriptions-item>
    </el-descriptions>

    <div style="height: 12px"></div>

    <el-descriptions :column="1" border size="small">
      <el-descriptions-item label="draft_id">{{ draft.draft_id }}</el-descriptions-item>
      <el-descriptions-item label="dsl_type">{{ draft.dsl_type }}</el-descriptions-item>
      <el-descriptions-item label="title">{{ draft.title }}</el-descriptions-item>
    </el-descriptions>

    <div style="height: 12px"></div>

    <el-alert
      title="SmartMermaid / 其它绘图面板预留"
      type="info"
      :closable="false"
      show-icon
      description="后续把 SmartMermaid、SVG-Edit、KG/RAG 的真实内容替换进来即可；面板切换由 draft.dsl_type 驱动。"
    />

    <div style="height: 12px"></div>

    <el-alert
      title="注意"
      type="warning"
      :closable="false"
      show-icon
      description="SVG 预览当前 prototype 未做 sanitize；生产建议加白名单或 DOMPurify。"
    />
  </el-drawer>
</template>

<script setup lang="ts">
interface Props {
  drawerOpen: boolean
  run: { run_id: string; status: string }
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
  (e: 'update:drawerOpen', value: boolean): void
}>()

const handleUpdate = (value: boolean) => {
  emit('update:drawerOpen', value)
}

const handleClose = () => {
  emit('update:drawerOpen', false)
}
</script>

<style scoped>
/* Drawer 样式由 Element Plus 提供 */
</style>
