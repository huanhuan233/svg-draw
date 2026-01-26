<template>
  <div class="svg-chat-panel">
    <div class="chat-header">
      <span class="chat-title">对话生成 SVG</span>
    </div>

    <!-- 消息列表 -->
    <div class="chat-messages" ref="messagesRef">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message-item', msg.role]"
      >
        <div class="message-content">
          <div class="message-text">{{ msg.content }}</div>
          <div v-if="msg.svg" class="message-svg-panel">
            <SvgGenPanel
              v-model="msg.svg"
              :loading="false"
              @push="handleApplySvg"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="chat-input-area">
      <el-input
        v-model="inputText"
        type="textarea"
        :rows="3"
        placeholder="输入提示词，生成 SVG..."
        @keydown.ctrl.enter="handleSend"
      />
      <div class="input-actions">
        <el-button type="primary" @click="handleSend" :loading="sending">
          发送
        </el-button>
        <el-button @click="handleMockSvg">使用示例 SVG</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import SvgGenPanel from './svg/SvgGenPanel.vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  svg?: string
}

const messages = ref<Message[]>([])
const inputText = ref('')
const sending = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  (e: 'apply-svg', svg: string): void
}>()

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const handleSend = async () => {
  if (!inputText.value.trim()) {
    return
  }

  const userMessage: Message = {
    role: 'user',
    content: inputText.value,
  }
  messages.value.push(userMessage)
  const currentInput = inputText.value
  inputText.value = ''
  sending.value = true

  scrollToBottom()

  // TODO: 后续对接后端 API
  // 当前使用 mock 响应
  setTimeout(() => {
    const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
  <circle cx="100" cy="100" r="50" fill="#548DF8" />
  <text x="100" y="110" text-anchor="middle" fill="white" font-size="16">${currentInput}</text>
</svg>`

    const assistantMessage: Message = {
      role: 'assistant',
      content: `已根据"${currentInput}"生成 SVG`,
      svg: mockSvg,
    }
    messages.value.push(assistantMessage)
    sending.value = false
    scrollToBottom()
  }, 500)
}

const handleMockSvg = () => {
  const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f7f8fa" />
  <rect x="50" y="50" width="300" height="200" fill="#548DF8" rx="8" />
  <text x="200" y="160" text-anchor="middle" fill="white" font-size="24" font-family="Microsoft YaHei">示例 SVG</text>
</svg>`

  const assistantMessage: Message = {
    role: 'assistant',
    content: '这是一个示例 SVG',
    svg: mockSvg,
  }
  messages.value.push(assistantMessage)
  scrollToBottom()
}

const handleApplySvg = (svg: string) => {
  if (!svg) {
    ElMessage.warning('SVG 内容为空')
    return
  }
  emit('apply-svg', svg)
  ElMessage.success('已推送到画布')
}
</script>

<style scoped>
.svg-chat-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.chat-title {
  font-size: 16px;
  font-weight: 400;
  color: #1d121b;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f7f8fa;
}

.message-item {
  margin-bottom: 16px;
}

.message-item.user {
  text-align: right;
}

.message-item.assistant {
  text-align: left;
}

.message-content {
  display: inline-block;
  max-width: 100%;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
}

.message-text {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  margin-bottom: 8px;
}

.message-item.user .message-text {
  background-color: #548df8;
  color: #ffffff;
}

.message-item.assistant .message-text {
  background-color: #ffffff;
  color: #1d121b;
  border: 1px solid #e4e7ed;
}

.message-svg-panel {
  margin-top: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background-color: #ffffff;
  height: 400px;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
}

.chat-input-area {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
</style>
