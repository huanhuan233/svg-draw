<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <b>SVG-Edit（iframe）</b>
        <el-tag type="info" effect="light">后续替换真实 SVG-Edit</el-tag>
      </div>
    </template>
    <div class="preview-box" style="padding: 0; overflow: hidden;">
      <iframe
        id="svgeditFrame"
        title="SVG-Edit"
        style="width: 100%; height: 420px; border: 0; background: #fff"
        :src="iframeSrc"
        @load="handleIframeLoad"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const iframeSrc = ref('/svgedit/editor/index.html')
const isReady = ref(false)

const handleIframeLoad = () => {
  console.log('SVG-Edit iframe loaded')
  // 等待 bridge.js 发送 READY 消息
}

const handleMessage = (event: MessageEvent) => {
  // 安全检查：只处理来自同源的消息
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.data?.type === 'READY' && event.data?.source === 'svgedit-bridge') {
    isReady.value = true
    console.log('SVG-Edit editor ready')
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})
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
