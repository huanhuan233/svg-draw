<template>
  <div class="svg-editor-pane">
    <div class="editor-header">
      <span class="editor-title">SVG 编辑器</span>
      <div class="header-right">
        <el-button
          :icon="FullScreen"
          circle
          size="small"
          @click="handleFitToScreen"
          title="适应屏幕"
        />
        <el-tag :type="isReady ? 'success' : 'warning'" size="small">
          {{ isReady ? '已就绪' : '加载中...' }}
        </el-tag>
      </div>
    </div>
    <div class="editor-wrapper">
      <iframe
        ref="editorIframe"
        src="/svgedit/editor/index.html"
        class="editor-iframe"
        frameborder="0"
        @load="handleIframeLoad"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'

const editorIframe = ref<HTMLIFrameElement | null>(null)
const isReady = ref(false)

const handleIframeLoad = () => {
  console.log('SVG-Edit iframe loaded')
}

const handleMessage = (event: MessageEvent) => {
  if (event.origin !== window.location.origin) {
    return
  }

  if (event.data?.type === 'READY') {
    isReady.value = true
    console.log('SVG-Edit editor ready')
  }
}

const handleFitToScreen = () => {
  if (!editorIframe.value || !isReady.value) {
    return
  }

  try {
    editorIframe.value.contentWindow?.postMessage(
      {
        type: 'FIT_TO_SCREEN',
      },
      '*'
    )
    console.log('Fit to screen message sent')
  } catch (error) {
    console.error('Failed to send fit to screen message:', error)
  }
}

const importSvg = (svgText: string) => {
  if (!editorIframe.value || !isReady.value) {
    console.warn('Editor not ready')
    return
  }

  try {
    editorIframe.value.contentWindow?.postMessage(
      {
        type: 'IMPORT_SVG',
        svg: svgText,
      },
      '*'
    )
    console.log('SVG import message sent')
  } catch (error) {
    console.error('Failed to send import message:', error)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
})

defineExpose({
  importSvg,
})
</script>

<style scoped>
.svg-editor-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-title {
  font-size: 16px;
  font-weight: 400;
  color: #1d121b;
}

.editor-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
  min-height: 0;
}

.editor-iframe {
  width: 100%;
  height: 100%;
  min-height: 100%;
  border: none;
  display: block;
}
</style>
