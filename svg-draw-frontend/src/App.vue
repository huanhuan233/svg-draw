<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="header-title">自动画图</h1>
        <div class="header-actions">
          <span class="theme-label">暗色模式</span>
          <el-switch
            v-model="isDark"
            :active-text="'开'"
            :inactive-text="'关'"
            @change="handleThemeChange"
          />
        </div>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const THEME_KEY = 'svgdraw.theme'
const isDark = ref(false)

const applyTheme = (dark: boolean) => {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
}

const initTheme = () => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark') {
    isDark.value = true
  } else if (saved === 'light') {
    isDark.value = false
  } else {
    isDark.value = false
  }
  applyTheme(isDark.value)
}

const handleThemeChange = (value: string | number | boolean) => {
  const next = Boolean(value)
  isDark.value = next
  localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  applyTheme(isDark.value)
}

onMounted(() => {
  initTheme()
})
</script>

<style>
.app-container {
  min-height: 100vh;
}

.app-header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 0;
  height: 64px !important;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 24px;
}

.header-title {
  font-size: 16px;
  font-weight: 400;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-label {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.app-main {
  padding: 0;
  background-color: var(--el-bg-color-page);
}
</style>
