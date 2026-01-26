<template>
  <el-card shadow="never">
    <template #header>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <b>SVG-Edit（iframe）</b>
        <el-tag type="info" effect="light">后续替换真实 SVG-Edit</el-tag>
      </div>
    </template>
    <div class="svgedit-container">
      <iframe
        id="svgeditFrame"
        title="SVG-Edit"
        class="svgedit-iframe"
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
.svgedit-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  display: flex;
  flex-direction: column;
  /* 确保容器占据父容器的全部可用空间 */
  flex: 1;
}

.svgedit-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
  flex: 1;
  min-height: 0;
  /* 确保 iframe 内容不被压缩，保持原始比例 */
  display: block;
}

/* 暗色主题适配 */
html.dark .svgedit-iframe {
  background: var(--el-bg-color);
}

/* 确保 SVG-Edit 内部的布局不会被压缩 */
.svgedit-iframe {
  /* 防止内容缩放 */
  transform: scale(1);
  transform-origin: top left;
}
</style>
