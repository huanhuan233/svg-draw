<template>
  <div class="svg-preview">
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="error-state">
      <el-alert
        :title="error"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
    <div v-else-if="warning" class="warning-state">
      <el-alert
        :title="warning"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>
    <div v-if="sanitizedSvg && !error" class="preview-content" v-html="sanitizedSvg" />
    <div v-else-if="!loading && !error && !svgText" class="empty-state">
      <el-empty description="暂无 SVG 内容" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  svgText: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const error = ref<string>('')
const warning = ref<string>('')

const sanitizeSvg = (svg: string): { svg: string; warning: string } => {
  error.value = ''
  warning.value = ''

  if (!svg || typeof svg !== 'string') {
    return { svg: '', warning: '' }
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svg, 'image/svg+xml')

    // 检查解析错误
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      error.value = 'SVG 解析失败，请检查代码格式'
      return { svg: '', warning: '' }
    }

    // 检查根元素是否为 svg
    const svgElement = doc.documentElement
    if (!svgElement || svgElement.tagName.toLowerCase() !== 'svg') {
      error.value = '未检测到有效的 <svg> 根元素'
      return { svg: '', warning: '' }
    }

    // 移除所有 script 标签
    const scripts = doc.querySelectorAll('script')
    if (scripts.length > 0) {
      scripts.forEach((script) => script.remove())
      warning.value = `已移除 ${scripts.length} 个 <script> 标签`
    }

    // 移除所有事件属性（on*）
    const allElements = doc.querySelectorAll('*')
    let removedEvents = 0
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name)
          removedEvents++
        }
      })
    })
    if (removedEvents > 0) {
      warning.value = warning.value
        ? `${warning.value}，已移除 ${removedEvents} 个事件属性`
        : `已移除 ${removedEvents} 个事件属性`
    }

    // 移除外链资源
    const links = doc.querySelectorAll('[href], [xlink\\:href]')
    let removedLinks = 0
    links.forEach((link) => {
      const href = link.getAttribute('href') || link.getAttribute('xlink:href') || ''
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('data:')) {
        link.removeAttribute('href')
        link.removeAttribute('xlink:href')
        removedLinks++
      }
    })
    if (removedLinks > 0) {
      warning.value = warning.value
        ? `${warning.value}，已移除 ${removedLinks} 个外链资源`
        : `已移除 ${removedLinks} 个外链资源`
    }

    // 序列化回字符串
    const serializer = new XMLSerializer()
    const sanitized = serializer.serializeToString(doc)

    return { svg: sanitized, warning: warning.value }
  } catch (e) {
    error.value = `SVG 处理失败: ${e instanceof Error ? e.message : '未知错误'}`
    return { svg: '', warning: '' }
  }
}

const sanitizedSvg = computed(() => {
  if (!props.svgText) {
    return ''
  }

  const result = sanitizeSvg(props.svgText)
  if (result.warning && !warning.value) {
    warning.value = result.warning
  }
  return result.svg
})

watch(() => props.svgText, () => {
  // 重置错误和警告状态
  error.value = ''
  warning.value = ''
})
</script>

<style scoped>
.svg-preview {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  overflow: auto;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.loading-state,
.error-state,
.warning-state {
  padding: 16px;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 0;
  background-color: #ffffff;
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
}

.preview-content :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
  max-height: 100%;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
