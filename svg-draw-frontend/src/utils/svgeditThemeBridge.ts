/**
 * SVG-Edit 主题桥接工具
 * 用于在宿主 Vue 应用中向 SVG-Edit iframe 注入主题 CSS
 */

import { patchSvgEditDom, ENABLE_SVGEDIT_PATCH } from './svgeditSkinPatcher'

export type Theme = 'light' | 'dark'

const TOKENS_LINK_ID = 'svgedit-tokens-link'
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

    // 1. 查找或创建 tokens link（必须先加载）
    let tokensLink = doc.getElementById(TOKENS_LINK_ID) as HTMLLinkElement | null
    if (!tokensLink) {
      tokensLink = doc.createElement('link')
      tokensLink.id = TOKENS_LINK_ID
      tokensLink.rel = 'stylesheet'
      tokensLink.type = 'text/css'
      // 插入到 head 最前面，确保 tokens 先加载
      doc.head.insertBefore(tokensLink, doc.head.firstChild)
    }
    tokensLink.href = '/themes/svgedit-tokens.css'

    // 2. 查找或创建主题 link（在 tokens 之后）
    let themeLink = doc.getElementById(THEME_LINK_ID) as HTMLLinkElement | null
    if (!themeLink) {
      themeLink = doc.createElement('link')
      themeLink.id = THEME_LINK_ID
      themeLink.rel = 'stylesheet'
      themeLink.type = 'text/css'
      // 插入到 tokens link 之后
      if (tokensLink.nextSibling) {
        doc.head.insertBefore(themeLink, tokensLink.nextSibling)
      } else {
        doc.head.appendChild(themeLink)
      }
    }

    // 更新主题 CSS 路径
    const themePath = `/themes/svgedit-element-${theme}.css`
    themeLink.href = themePath

    // 设置 data-theme 属性（便于 CSS 内做细分）
    doc.documentElement.setAttribute('data-theme', theme)
    doc.documentElement.dataset.theme = theme
    doc.body?.setAttribute('data-theme', theme)

    // 3. 执行 DOM patch（如果启用）
    if (ENABLE_SVGEDIT_PATCH) {
      // 延迟一下，确保 CSS 已加载
      setTimeout(() => {
        try {
          patchSvgEditDom(doc)
        } catch (patchError) {
          // patch 失败不影响主题应用
          console.warn('[SVG-Edit Theme] DOM patch failed (non-fatal):', patchError)
        }
      }, 50)
    }

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
