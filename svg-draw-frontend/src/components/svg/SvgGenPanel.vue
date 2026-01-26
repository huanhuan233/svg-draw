<template>
  <div class="svg-gen-panel">
    <!-- 工具栏 -->
    <div class="panel-toolbar">
      <div class="toolbar-left">
        <el-segmented v-model="currentMode" :options="modeOptions" size="small" />
      </div>
      <div class="toolbar-right">
        <el-button
          :icon="ZoomIn"
          circle
          size="small"
          @click="handleZoom"
          title="放大查看"
        />
        <el-button
          type="primary"
          :icon="Upload"
          size="small"
          @click="handlePush"
          :loading="loading"
          title="推送到编辑器"
        >
          推送
        </el-button>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="panel-content">
      <SvgCodeEditor
        v-if="currentMode === 'code'"
        v-model="localSvgText"
        :loading="loading"
      />
      <SvgPreview
        v-else
        :svg-text="localSvgText"
        :loading="loading"
      />
    </div>

    <!-- 全屏 Dialog -->
    <el-dialog
      v-model="zoomVisible"
      title="SVG 预览与编辑"
      fullscreen
      :close-on-click-modal="false"
    >
      <div class="zoom-content">
        <div class="zoom-toolbar">
          <el-segmented v-model="zoomMode" :options="modeOptions" size="small" />
        </div>
        <div class="zoom-body">
          <SvgCodeEditor
            v-if="zoomMode === 'code'"
            v-model="localSvgText"
            :loading="loading"
            :rows="30"
          />
          <SvgPreview
            v-else
            :svg-text="localSvgText"
            :loading="loading"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="zoomVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePushFromZoom">推送到编辑器</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ZoomIn, Upload } from '@element-plus/icons-vue'
import SvgCodeEditor from './SvgCodeEditor.vue'
import SvgPreview from './SvgPreview.vue'

interface Props {
  modelValue: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'push', svgText: string): void
}>()

const currentMode = ref<'code' | 'preview'>('preview')
const zoomMode = ref<'code' | 'preview'>('preview')
const zoomVisible = ref(false)

const modeOptions = [
  { label: '代码模式', value: 'code' },
  { label: '预览模式', value: 'preview' },
]

const localSvgText = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const validateSvg = (svg: string): boolean => {
  if (!svg || typeof svg !== 'string') {
    return false
  }
  const trimmed = svg.trim()
  return trimmed.includes('<svg') && trimmed.includes('</svg>')
}

const handlePush = () => {
  if (!validateSvg(localSvgText.value)) {
    ElMessage.error('SVG 代码不完整或格式错误')
    return
  }
  emit('push', localSvgText.value)
}

const handlePushFromZoom = () => {
  handlePush()
  zoomVisible.value = false
}

const handleZoom = () => {
  zoomMode.value = currentMode.value
  zoomVisible.value = true
}
</script>

<style scoped>
.svg-gen-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  width: 100%;
  box-sizing: border-box;
}

.panel-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.panel-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.zoom-content {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 160px);
  min-height: 0;
}

.zoom-toolbar {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.zoom-body {
  flex: 1;
  overflow: hidden;
  padding: 16px;
  background-color: #f7f8fa;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
