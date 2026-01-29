<template>
  <el-card shadow="never" class="svgedit-card" :class="{ 'is-fullscreen': isFullscreen }">
    <template #header>
      <div class="svgedit-header">
        <b>SVG-Edit</b>
        <el-button
          class="fullscreen-btn"
          text
          circle
          title="全屏"
          @click="toggleFullscreen"
        >
          <el-icon><FullScreen /></el-icon>
        </el-button>
      </div>
    </template>
    <div class="svgedit-container">
      <iframe
        ref="iframeRef"
        id="svgeditFrame"
        title="SVG-Edit"
        class="svgedit-iframe"
        :src="iframeSrc"
        @load="handleIframeLoad"
      />
      <!-- 全屏时：顶部条带，鼠标移入才显示 X -->
      <div
        v-show="isFullscreen"
        class="svgedit-exit-bar"
        :class="{ 'is-visible': topHover }"
        @mouseenter="topHover = true"
        @mouseleave="topHover = false"
      >
        <div class="svgedit-exit-hotspot">
          <el-button
            class="exit-btn"
            circle
            title="退出全屏（Esc）"
            @click="exitFullscreen"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { bindThemeToIframe, ensureIframeTheme } from '../../utils/svgeditThemeBridge'
import { useTheme } from '../../composables/useTheme'
import { patchIframeDom, ENABLE_SVGEDIT_PATCH } from '../../utils/svgeditSkinPatcher'

const iframeSrc = ref('/svgedit/editor/index.html')
const isReady = ref(false)
const isFullscreen = ref(false)
const topHover = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

// 主题管理
const { getTheme, watchTheme } = useTheme()
let themeCleanup: (() => void) | null = null

const exitFullscreen = () => {
  isFullscreen.value = false
}

const handleIframeLoad = async () => {
  console.log('SVG-Edit iframe loaded')
  // 等待 bridge.js 发送 READY 消息
  
  // 确保主题已应用（iframe reload 后）
  if (iframeRef.value) {
    await ensureIframeTheme(iframeRef.value, getTheme())
    
    // 执行 DOM patch（延迟确保 SVG-Edit 已初始化）
    if (ENABLE_SVGEDIT_PATCH) {
      setTimeout(() => {
        patchIframeDom(iframeRef.value!)
      }, 200)
    }
  }
}

const applyFullscreen = (enabled: boolean) => {
  const body = document.body
  body.classList.toggle('svgedit-fullscreen-open', enabled)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (!isFullscreen.value) topHover.value = false
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    isFullscreen.value = false
  }
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
  window.addEventListener('keydown', handleKeydown)
  
  // 绑定主题到 iframe（使用 nextTick 确保 iframe ref 已赋值）
  nextTick(() => {
    themeCleanup = bindThemeToIframe({
      iframeRef,
      getTheme,
      watchTheme,
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('message', handleMessage)
  window.removeEventListener('keydown', handleKeydown)
  applyFullscreen(false)
  
  // 清理主题监听
  if (themeCleanup) {
    themeCleanup()
    themeCleanup = null
  }
})

watch(isFullscreen, (val) => {
  applyFullscreen(val)
})
</script>

<style scoped>
.svgedit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fullscreen-btn {
  width: 32px;
  height: 32px;
}

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

/* 全屏：无顶栏，iframe 彻底填满 */
.svgedit-card.is-fullscreen {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  margin: 0;
  border-radius: 0;
}

.svgedit-card.is-fullscreen :deep(.el-card__header) {
  display: none;
}

.svgedit-card.is-fullscreen :deep(.el-card__body) {
  height: 100vh;
  padding: 0;
}

.svgedit-card.is-fullscreen .svgedit-container {
  position: relative;
  min-height: 0;
  height: 100vh;
  border: 0;
  border-radius: 0;
}

/* 全屏时顶部条带：默认透明，鼠标移入才显示 X */
.svgedit-container {
  position: relative;
}

.svgedit-exit-bar {
  position: absolute;
  top: 0;
  right: 0;
  width: 72px;
  height: 56px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  background: transparent;
  pointer-events: auto;
  transition: background 0.2s ease;
}

.svgedit-exit-bar.is-visible {
  background: linear-gradient(to bottom left, rgba(0, 0, 0, 0.4), transparent);
}

.svgedit-exit-bar .exit-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.svgedit-exit-bar.is-visible .exit-btn {
  opacity: 1;
}

.svgedit-exit-hotspot {
  width: 72px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.exit-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95) !important;
  color: #333;
  border: none;
}

.exit-btn:hover {
  background: #fff !important;
  color: #333;
}
</style>

<style>
/* 全屏时锁定页面滚动（全局样式，不能 scoped） */
body.svgedit-fullscreen-open {
  overflow: hidden;
}
</style>
