/**
 * 主题状态管理 Composable
 * 从 App.vue 的 localStorage 和 DOM 读取主题状态
 */

import { ref, watch, onMounted, type Ref } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'svgdraw.theme'

/**
 * 获取当前主题（从 DOM 或 localStorage）
 */
export function getCurrentTheme(): Theme {
  // 优先从 DOM 读取（App.vue 已经应用了）
  if (document.documentElement.classList.contains('dark')) {
    return 'dark'
  }

  // 降级：从 localStorage 读取
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark') {
    return 'dark'
  }

  return 'light'
}

/**
 * 监听主题变化
 * @param callback - 主题变化回调
 * @returns unwatch 函数
 */
export function watchTheme(callback: (theme: Theme) => void): () => void {
  // 使用 MutationObserver 监听 html.dark 类变化
  const observer = new MutationObserver(() => {
    const theme = getCurrentTheme()
    callback(theme)
  })

  // 观察 document.documentElement 的 class 属性变化
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  // 立即触发一次
  callback(getCurrentTheme())

  // 返回清理函数
  return () => {
    observer.disconnect()
  }
}

/**
 * 使用主题的 Composable
 * 返回当前主题和监听函数
 */
export function useTheme() {
  const theme = ref<Theme>(getCurrentTheme())

  // 监听主题变化
  const unwatch = watchTheme((newTheme) => {
    theme.value = newTheme
  })

  // 组件卸载时清理
  onMounted(() => {
    // 确保初始值正确
    theme.value = getCurrentTheme()
  })

  return {
    theme,
    getTheme: () => getCurrentTheme(),
    watchTheme,
  }
}
