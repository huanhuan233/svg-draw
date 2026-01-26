<template>
  <div class="svg-code-editor">
    <textarea
      v-model="localValue"
      :disabled="loading"
      placeholder="SVG 代码将显示在这里..."
      class="code-textarea"
      @input="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  loading?: boolean
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rows: 15,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const localValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal
})

const handleInput = (e: Event) => {
  const value = (e.target as HTMLTextAreaElement).value
  localValue.value = value
  emit('update:modelValue', value)
}
</script>

<style scoped>
.svg-code-editor {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.code-textarea {
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  overflow-x: hidden;
  overflow-y: auto;
  color: #1d121b;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  resize: none;
  width: 100% !important;
  height: 100% !important;
  min-height: 0;
  box-sizing: border-box;
  padding: 12px;
  margin: 0;
  outline: none;
  flex: 1;
}

.code-textarea:focus {
  border-color: #548df8;
}

.code-textarea:disabled {
  background-color: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
