<template>
  <div class="svg-chat-panel">
    <div class="left-head">
      <div>
        <div class="left-title">对话生成绘图</div>
        <div class="left-sub">链路：M2 输入 → M6 编排 → M7 草稿（M3/M4/M5 先 Stub）</div>
      </div>
      <el-segmented
        v-model="leftMode"
        :options="[
          { label: '对话', value: 'chat' },
          { label: '记录', value: 'history' },
        ]"
      />
    </div>

    <div class="chat-body" id="chatBody">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="msg-row"
        :class="{ user: msg.role === 'user' }"
      >
        <div class="bubble">{{ msg.text }}</div>
      </div>
    </div>

    <div class="chat-foot">
      <el-input
        v-model="prompt"
        type="textarea"
        :rows="4"
        placeholder="例如：创建一个流程图 / 画一个系统架构图 / 生成泳道图…"
        @keydown.ctrl.enter="handleSend"
      />

      <div class="foot-actions">
        <div class="tags">
          <el-tag effect="plain">run: {{ run.run_id }}</el-tag>
          <el-tag effect="plain">draft: {{ draft.draft_id }}</el-tag>
          <el-tag effect="plain">dsl: {{ draft.dsl_type }}</el-tag>
        </div>

        <div class="buttons">
          <el-button @click="handleExample">示例</el-button>
          <el-button type="primary" @click="handleSend" :loading="sending">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Ref } from 'vue'

interface Props {
  messages: Array<{ role: 'user' | 'ai' | 'system'; text: string }>
  prompt: string
  run: { run_id: string; status: string }
  draft: {
    draft_id: string
    dsl_type: string
    title: string
    router_reason: string
    code: string
  }
  leftMode: 'chat' | 'history'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:prompt', value: string): void
  (e: 'update:leftMode', value: 'chat' | 'history'): void
  (e: 'send', text: string): void
  (e: 'example'): void
}>()

const sending = ref(false)

const prompt = ref(props.prompt)
const leftMode = ref(props.leftMode)

watch(() => props.prompt, (val) => {
  prompt.value = val
})

watch(() => props.leftMode, (val) => {
  leftMode.value = val
})

watch(prompt, (val) => {
  emit('update:prompt', val)
})

watch(leftMode, (val) => {
  emit('update:leftMode', val)
})

const handleSend = () => {
  const text = prompt.value.trim()
  if (!text || sending.value) return
  
  sending.value = true
  emit('send', text)
  
  // 重置发送状态（由父组件控制实际发送流程）
  setTimeout(() => {
    sending.value = false
  }, 100)
}

const handleExample = () => {
  emit('example')
}
</script>

<style scoped>
.svg-chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  min-height: 0;
}

.left-head {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: var(--el-bg-color);
}

.left-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.left-sub {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.35;
}

.chat-body {
  flex: 1;
  min-height: 0;
  padding: 12px;
  overflow: auto;
  background: var(--el-bg-color);
}

.msg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.msg-row.user {
  flex-direction: row-reverse;
}

.bubble {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.msg-row.user .bubble {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-7);
}

.chat-foot {
  padding: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.foot-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.buttons {
  display: flex;
  gap: 8px;
}
</style>
