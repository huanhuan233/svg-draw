<template>
  <div class="svg-draw-workspace">
    <el-container class="workspace-container">
      <!-- 左侧对话面板 -->
      <el-aside class="chat-aside" width="400px">
        <SvgChatPanel @apply-svg="handleApplySvg" />
      </el-aside>

      <!-- 右侧编辑器 -->
      <el-main class="editor-main">
        <SvgEditorPane ref="editorRef" />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgChatPanel from '../components/SvgChatPanel.vue'
import SvgEditorPane from '../components/SvgEditorPane.vue'

const editorRef = ref<InstanceType<typeof SvgEditorPane> | null>(null)

const handleApplySvg = (svgText: string) => {
  if (editorRef.value) {
    editorRef.value.importSvg(svgText)
  }
}
</script>

<style scoped>
.svg-draw-workspace {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.workspace-container {
  height: 100%;
}

.chat-aside {
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
}

.editor-main {
  padding: 0;
  background-color: #f7f8fa;
  overflow: hidden;
}
</style>
