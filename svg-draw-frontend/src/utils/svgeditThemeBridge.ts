/**
 * SVG-Edit 主题桥接工具
 * 用于在宿主 Vue 应用中向 SVG-Edit iframe 注入主题 CSS
 */

import { patchSvgEditShadowThemes } from './svgeditShadowThemePatcher'

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
      if (tokensLink.nextSibling) {
        doc.head.insertBefore(themeLink, tokensLink.nextSibling)
      } else {
        doc.head.appendChild(themeLink)
      }
    }

    // 更新主题 CSS 路径
    const themePath = `/themes/svgedit-element-${theme}.css`
    themeLink.href = themePath

    // 设置 data-theme 属性
    doc.documentElement.setAttribute('data-theme', theme)
    doc.documentElement.dataset.theme = theme
    doc.body?.setAttribute('data-theme', theme)

    // 强制覆盖 SVG-Edit 原生 CSS 变量
    if (theme === 'light') {
      const styleOverride = doc.getElementById('se-theme-override') || doc.createElement('style')
      styleOverride.id = 'se-theme-override'
      styleOverride.textContent = `
        :root {
          --main-bg-color: #f7f8fa !important;
          --canvas-bg-color: #ffffff !important;
          --text-color: #303133 !important;
        }
        .svg_editor {
          background: #f7f8fa !important;
          color: #303133 !important;
        }
        #workarea {
          background-color: #f5f7fa !important;
        }
        #svgcanvas {
          background-color: #ffffff !important;
          background: #ffffff !important;
        }
        /* 确保画布背景矩形是白色 */
        #svgcanvas rect[id="canvasBackground"] {
          fill: #ffffff !important;
        }
        /* 主按钮文字必须是黑色 */
        #main_button,
        #main_icon,
        #main_icon span {
          color: #303133 !important;
        }
        /* 选中状态的图标必须是蓝色（SVG）- 只影响工具栏，不影响画布 */
        #tools_left button.selected svg *,
        #tools_left se-button[pressed] svg *,
        #tools_top button.selected svg *,
        #tools_top se-button[pressed] svg * {
          fill: #409eff !important;
          stroke: #409eff !important;
        }
        /* 重要：确保画布内的SVG内容完全不受影响 */
        #svgcontent,
        #svgroot,
        #svgcontent *,
        #svgroot * {
          /* 不设置任何样式，让SVG使用自己的fill/stroke属性 */
        }
        /* 浅色模式：所有工具栏区域的 img 图标默认蓝色 */
        #tools_left img,
        #tools_top img,
        #tools_bottom img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important;
          transition: filter 0.2s ease !important;
        }
        /* 选中状态的图标保持蓝色 */
        #tools_left button.selected img,
        #tools_left se-button[pressed] img,
        #tools_top button.selected img,
        #tools_top se-button[pressed] img,
        se-button[pressed] img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important;
        }
        /* hover 状态的 img 图标（保持蓝色） */
        #tools_left button:hover img,
        #tools_left se-button:hover img,
        #tools_top button:hover img,
        #tools_top se-button:hover img,
        se-button:hover img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important;
        }
        /* 浅色模式：选中框是蓝色，背景透明 */
        #tools_left button,
        #tools_left se-button,
        #tools_left se-flyingbutton,
        #tools_left se-flyingbutton se-button {
          background-color: transparent !important;
          background: transparent !important;
        }
        #tools_left button.selected,
        #tools_left se-button[pressed],
        #tools_left se-flyingbutton[pressed],
        #tools_left se-flyingbutton se-button[pressed] {
          background-color: transparent !important;
          background: transparent !important;
          border-color: #409eff !important;
        }
        /* 确保 se-button 和 se-flyingbutton Shadow DOM 内部 div 背景透明 */
        se-button::part(button),
        se-button::part(div),
        se-flyingbutton::part(button),
        se-flyingbutton::part(div) {
          background-color: transparent !important;
          background: transparent !important;
        }
        /* 浅色模式：所有工具栏区域的 img 图标默认蓝色（包括 se-flyingbutton 内） */
        #tools_left img,
        #tools_top img,
        #tools_bottom img,
        #tools_left se-flyingbutton img,
        #tools_left se-flyingbutton se-button img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important;
          transition: filter 0.2s ease !important;
        }
      `
      if (!doc.getElementById('se-theme-override')) {
        doc.head.appendChild(styleOverride)
      }
    } else if (theme === 'dark') {
      // 深色模式：图标蓝色，选中框白色
      const styleOverride = doc.getElementById('se-theme-override') || doc.createElement('style')
      styleOverride.id = 'se-theme-override'
      styleOverride.textContent = `
        /* 深色模式：所有工具栏区域的 img 图标默认蓝色 */
        #tools_left img,
        #tools_top img,
        #tools_bottom img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important;
        }
        /* 深色模式：选中框是白色，背景透明 */
        #tools_left button,
        #tools_left se-button,
        #tools_left se-flyingbutton,
        #tools_left se-flyingbutton se-button {
          background-color: transparent !important;
          background: transparent !important;
        }
        #tools_left button.selected,
        #tools_left se-button[pressed],
        #tools_left se-flyingbutton[pressed],
        #tools_left se-flyingbutton se-button[pressed] {
          background-color: transparent !important;
          background: transparent !important;
          border-color: #ffffff !important;
        }
        /* 确保 se-button 和 se-flyingbutton Shadow DOM 内部 div 背景透明 */
        se-button::part(button),
        se-button::part(div),
        se-flyingbutton::part(button),
        se-flyingbutton::part(div) {
          background-color: transparent !important;
          background: transparent !important;
        }
        /* 深色模式：所有工具栏区域的 img 图标默认蓝色（包括 se-flyingbutton 内） */
        #tools_left img,
        #tools_top img,
        #tools_bottom img,
        #tools_left se-flyingbutton img,
        #tools_left se-flyingbutton se-button img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important;
        }
      `
      if (!doc.getElementById('se-theme-override')) {
        doc.head.appendChild(styleOverride)
      }
    }

    console.log(`[SVG-Edit Theme] Applied ${theme} theme to iframe`)
    
    // 应用 Shadow DOM 主题修复
    patchSvgEditShadowThemes(doc, theme)
  } catch (error) {
    console.warn(
      '[SVG-Edit Theme] Cannot inject theme CSS (cross-origin or access denied):',
      error
    )
  }
}

/**
 * 绑定主题到 iframe
 */
export interface BindThemeOptions {
  iframeRef: { value: HTMLIFrameElement | null }
  getTheme: () => Theme
  watchTheme: (callback: (theme: Theme) => void) => () => void
}

export function bindThemeToIframe(options: BindThemeOptions): () => void {
  const { iframeRef, getTheme, watchTheme } = options

  const applyTheme = async () => {
    const iframe = iframeRef.value
    if (!iframe) {
      return
    }
    const theme = getTheme()
    await ensureIframeTheme(iframe, theme)
    // ensureIframeTheme 内部已调用 patchSvgEditShadowThemes
  }

  const handleLoad = () => {
    applyTheme()
  }

  const bindLoadEvent = () => {
    if (iframeRef.value) {
      iframeRef.value.addEventListener('load', handleLoad)
    }
  }

  setTimeout(() => {
    applyTheme()
    bindLoadEvent()
  }, 0)

  const unwatchTheme = watchTheme((theme) => {
    applyTheme()
  })

  return () => {
    unwatchTheme()
    if (iframeRef.value) {
      iframeRef.value.removeEventListener('load', handleLoad)
    }
  }
}
