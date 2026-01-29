/**
 * SVG-Edit 主题桥接工具
 * 用于在宿主 Vue 应用中向 SVG-Edit iframe 注入主题 CSS
 */

export type Theme = 'light' | 'dark'

const THEME_LINK_ID = 'svgedit-theme-link'

/**
 * 确保 iframe 应用指定主题
 * @param iframe - SVG-Edit iframe 元素
 * @param theme - 主题类型
 */
export async function ensureIframeTheme(
  iframe: HTMLIFrameElement,
  theme: Theme
): Promise<void> {
  try {
    // 尝试访问 iframe 的 contentDocument（同域）
    const doc = iframe.contentDocument || iframe.contentWindow?.document

    if (!doc) {
      throw new Error('Cannot access iframe contentDocument')
    }

    // 等待文档加载完成
    if (doc.readyState === 'loading') {
      await new Promise<void>((resolve) => {
        const handler = () => {
          doc.removeEventListener('DOMContentLoaded', handler)
          resolve()
        }
        doc.addEventListener('DOMContentLoaded', handler)
        // 如果已经加载完成，立即 resolve
        if (doc.readyState !== 'loading') {
          resolve()
        }
      })
    }

    // 查找或创建主题 link 元素
    let themeLink = doc.getElementById(THEME_LINK_ID) as HTMLLinkElement | null

    if (!themeLink) {
      themeLink = doc.createElement('link')
      themeLink.id = THEME_LINK_ID
      themeLink.rel = 'stylesheet'
      themeLink.type = 'text/css'
      doc.head.appendChild(themeLink)
    }

    // 更新主题 CSS 路径
    const themePath = `/themes/svgedit-element-${theme}.css`
    themeLink.href = themePath

    // 设置 data-theme 属性（便于 CSS 内做细分）
    doc.documentElement.setAttribute('data-theme', theme)
    doc.body?.setAttribute('data-theme', theme)

    console.log(`[SVG-Edit Theme] Applied ${theme} theme to iframe`)
  } catch (error) {
    // 跨域或访问失败
    console.warn(
      '[SVG-Edit Theme] Cannot inject theme CSS (cross-origin or access denied):',
      error
    )
    console.warn(
      '[SVG-Edit Theme] 建议：将 SVG-Edit 静态资源改为同域路径（Nginx/Vite 静态目录）'
    )

    // 降级方案：使用 postMessage
    try {
      iframe.contentWindow?.postMessage(
        {
          type: 'SVGED_THEME',
          theme,
        },
        '*'
      )
      console.log(`[SVG-Edit Theme] Sent theme via postMessage: ${theme}`)
    } catch (postError) {
      console.error('[SVG-Edit Theme] Failed to send theme via postMessage:', postError)
    }
  }
}

/**
 * 绑定主题到 iframe
 * @param options - 配置选项
 */
export interface BindThemeOptions {
  /** iframe ref */
  iframeRef: { value: HTMLIFrameElement | null }
  /** 获取当前主题的函数 */
  getTheme: () => Theme
  /** 监听主题变化的函数，返回 unwatch 函数 */
  watchTheme: (callback: (theme: Theme) => void) => () => void
}

export function bindThemeToIframe(options: BindThemeOptions): () => void {
  const { iframeRef, getTheme, watchTheme } = options

  // 应用主题的函数
  const applyTheme = async () => {
    const iframe = iframeRef.value
    if (!iframe) {
      return
    }

    const theme = getTheme()
    await ensureIframeTheme(iframe, theme)
  }

  // 监听 iframe load 事件（解决 reload 问题）
  const handleLoad = () => {
    applyTheme()
  }

  // 绑定 load 事件的函数
  const bindLoadEvent = () => {
    if (iframeRef.value) {
      iframeRef.value.addEventListener('load', handleLoad)
    }
  }

  // 立即应用一次（mount 时）
  // 使用 nextTick 确保 iframe ref 已经赋值
  setTimeout(() => {
    applyTheme()
    bindLoadEvent()
  }, 0)

  // 监听主题变化
  const unwatchTheme = watchTheme((theme) => {
    applyTheme()
  })

  // 返回清理函数
  return () => {
    unwatchTheme()
    if (iframeRef.value) {
      iframeRef.value.removeEventListener('load', handleLoad)
    }
  }
}
