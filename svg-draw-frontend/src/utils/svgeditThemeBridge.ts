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
          --ruler-color: #409eff !important; /* 标尺蓝色背景 */
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
        /* 选中状态的图标必须是白色（SVG）- 侧栏按钮背景是蓝色 */
        #tools_left button.selected svg *,
        #tools_left se-button[pressed] svg * {
          fill: #ffffff !important;
          stroke: #ffffff !important;
        }
        /* 顶部和底部工具栏选中状态的图标保持蓝色 */
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
        /* 浅色模式：侧栏按钮图标为白色（因为背景是蓝色），顶部和底部工具栏图标为蓝色 */
        #tools_left img {
          filter: brightness(0) invert(1) !important; /* 白色 */
          transition: filter 0.2s ease !important;
        }
        #tools_top img,
        #tools_bottom img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important; /* 蓝色 */
          transition: filter 0.2s ease !important;
        }
        /* 选中状态的图标：侧栏保持白色，顶部和底部保持蓝色 */
        #tools_left button.selected img,
        #tools_left se-button[pressed] img {
          filter: brightness(0) invert(1) !important; /* 白色 */
        }
        #tools_top button.selected img,
        #tools_top se-button[pressed] img,
        se-button[pressed] img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important; /* 蓝色 */
        }
        /* hover 状态的 img 图标：侧栏保持白色，顶部和底部保持蓝色 */
        #tools_left button:hover img,
        #tools_left se-button:hover img {
          filter: brightness(0) invert(1) !important; /* 白色 */
        }
        #tools_top button:hover img,
        #tools_top se-button:hover img,
        se-button:hover img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important; /* 蓝色 */
        }
        /* 浅色模式：所有侧栏按钮都是蓝底白字 */
        #tools_left button,
        #tools_left se-button,
        #tools_left se-flyingbutton,
        #tools_left se-flyingbutton se-button {
          background-color: #409eff !important; /* 蓝色背景 */
          background: #409eff !important;
          color: #ffffff !important; /* 白色图标 */
          border-color: #409eff !important;
        }
        #tools_left button:hover,
        #tools_left se-button:hover,
        #tools_left se-flyingbutton:hover,
        #tools_left se-flyingbutton se-button:hover {
          background-color: #337ecc !important; /* hover 时更深的蓝色 */
          background: #337ecc !important;
          border-color: #337ecc !important;
        }
        #tools_left button.selected,
        #tools_left se-button[pressed],
        #tools_left se-flyingbutton[pressed],
        #tools_left se-flyingbutton se-button[pressed] {
          background-color: #337ecc !important; /* 选中时更深的蓝色 */
          background: #337ecc !important;
          border-color: #337ecc !important;
          color: #ffffff !important;
        }
        /* 确保 se-button 和 se-flyingbutton Shadow DOM 内部 div 背景是蓝色 */
        #tools_left se-button::part(button),
        #tools_left se-button::part(div),
        #tools_left se-flyingbutton::part(button),
        #tools_left se-flyingbutton::part(div) {
          background-color: #409eff !important; /* 蓝色背景 */
          background: #409eff !important;
        }
        /* 浅色模式：侧栏按钮图标为白色（因为背景是蓝色），顶部和底部工具栏图标为蓝色 */
        #tools_left img,
        #tools_left se-flyingbutton img,
        #tools_left se-flyingbutton se-button img {
          filter: brightness(0) invert(1) !important; /* 白色 */
          transition: filter 0.2s ease !important;
        }
        #tools_top img,
        #tools_bottom img {
          filter: brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%) !important; /* 蓝色 */
          transition: filter 0.2s ease !important;
        }
        /* 顶部和底部工具栏按钮（se-zoom, se-colorpicker, se-select, se-list, se-spin-input, se-input 等）蓝底白字 */
        #tools_top se-zoom,
        #tools_top se-colorpicker,
        #tools_top se-select,
        #tools_top se-list,
        #tools_top se-spin-input,
        #tools_top se-input,
        #tools_bottom se-zoom,
        #tools_bottom se-colorpicker,
        #tools_bottom se-select,
        #tools_bottom se-list,
        #tools_bottom se-spin-input,
        #tools_bottom se-input {
          background-color: #409eff !important; /* 蓝色背景 */
          color: #ffffff !important; /* 白色文字 */
          border-radius: 4px !important;
        }
        #tools_top se-zoom:hover,
        #tools_top se-colorpicker:hover,
        #tools_top se-select:hover,
        #tools_top se-list:hover,
        #tools_top se-spin-input:hover,
        #tools_top se-input:hover,
        #tools_bottom se-zoom:hover,
        #tools_bottom se-colorpicker:hover,
        #tools_bottom se-select:hover,
        #tools_bottom se-list:hover,
        #tools_bottom se-spin-input:hover,
        #tools_bottom se-input:hover {
          background-color: #66b1ff !important; /* hover时浅蓝色 */
        }
        /* SVG图标保持原色，不强制渲染 */
        #tools_top se-zoom svg,
        #tools_top se-zoom img,
        #tools_top se-colorpicker svg,
        #tools_top se-colorpicker img,
        #tools_top se-select svg,
        #tools_top se-select img,
        #tools_top se-list svg,
        #tools_top se-list img,
        #tools_top se-spin-input svg,
        #tools_top se-spin-input img,
        #tools_top se-input svg,
        #tools_top se-input img,
        #tools_bottom se-zoom svg,
        #tools_bottom se-zoom img,
        #tools_bottom se-colorpicker svg,
        #tools_bottom se-colorpicker img,
        #tools_bottom se-select svg,
        #tools_bottom se-select img,
        #tools_bottom se-list svg,
        #tools_bottom se-list img,
        #tools_bottom se-spin-input svg,
        #tools_bottom se-spin-input img,
        #tools_bottom se-input svg,
        #tools_bottom se-input img {
          filter: none !important; /* 保持原色，不应用任何filter */
        }
        #tools_top se-zoom svg *,
        #tools_top se-colorpicker svg *,
        #tools_top se-select svg *,
        #tools_top se-list svg *,
        #tools_top se-spin-input svg *,
        #tools_top se-input svg *,
        #tools_bottom se-zoom svg *,
        #tools_bottom se-colorpicker svg *,
        #tools_bottom se-select svg *,
        #tools_bottom se-list svg *,
        #tools_bottom se-spin-input svg *,
        #tools_bottom se-input svg * {
          fill: inherit !important; /* 继承原色 */
          stroke: inherit !important; /* 继承原色 */
        }
        /* 标尺样式：蓝色背景和蓝色边框 */
        #ruler_corner,
        #ruler_x,
        #ruler_y {
          background: #409eff !important;
        }
        /* 标尺边缘线改为蓝色 */
        #ruler_x {
          border-bottom: 1px solid #409eff !important;
          border-left: 1px solid #409eff !important;
        }
        #ruler_y {
          border-right: 1px solid #409eff !important;
          border-top: 1px solid #409eff !important;
        }
        #ruler_corner {
          border-right: 1px solid #409eff !important;
          border-bottom: 1px solid #409eff !important;
        }
        /* 顶栏上下文面板（id class x y label） */
        #cur_context_panel {
          background: #ffffff !important; /* 白色背景 */
          color: #409eff !important; /* 蓝色文字 */
        }
        #cur_context_panel a {
          color: #409eff !important; /* 蓝色链接 */
        }
        #cur_context_panel a:hover {
          color: #66b1ff !important; /* hover时浅蓝色 */
          text-decoration: underline !important;
        }
        /* 选中面板背景保持白色 */
        .selected_panel,
        .xy_panel {
          background: transparent !important;
          background-color: transparent !important;
        }
        /* 滚动条样式（反色：白色轨道，蓝色滑块） */
        ::-webkit-scrollbar {
          width: 12px !important;
          height: 12px !important;
        }
        ::-webkit-scrollbar-track {
          background: #ffffff !important; /* 白色轨道 */
        }
        ::-webkit-scrollbar-thumb {
          background: #409eff !important; /* 蓝色滑块 */
          border-radius: 6px !important;
          border: 2px solid #ffffff !important; /* 白色边框 */
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #66b1ff !important; /* hover时浅蓝色 */
        }
        * {
          scrollbar-width: thin !important;
          scrollbar-color: #409eff #ffffff !important; /* 滑块颜色 轨道颜色 */
        }
        #workarea::-webkit-scrollbar-track {
          background: #ffffff !important;
        }
        #workarea::-webkit-scrollbar-thumb {
          background: #409eff !important;
          border-radius: 6px !important;
          border: 2px solid #ffffff !important;
        }
        #workarea::-webkit-scrollbar-thumb:hover {
          background: #66b1ff !important;
        }
        #tools_left::-webkit-scrollbar-thumb,
        #tools_bottom::-webkit-scrollbar-thumb {
          background-color: #409eff !important;
          border-radius: 3px !important;
        }
        #tools_left::-webkit-scrollbar-track,
        #tools_bottom::-webkit-scrollbar-track {
          background: #ffffff !important;
        }
      `
      if (!doc.getElementById('se-theme-override')) {
        doc.head.appendChild(styleOverride)
      }

      // 注入标尺Canvas绘制hook（浅色模式：白色刻度）
      if (theme === 'light' && !doc.getElementById('se-ruler-inject')) {
        const script = doc.createElement('script')
        script.id = 'se-ruler-inject'
        script.textContent = `
          (function() {
            // 检查canvas是否是标尺canvas
            function isRulerCanvas(canvas) {
              if (!canvas) return false
              const parent = canvas.closest ? canvas.closest('#ruler_x, #ruler_y, #ruler_corner') : null
              if (parent) return true
              // 也检查父元素
              let el = canvas.parentElement
              while (el) {
                if (el.id === 'ruler_x' || el.id === 'ruler_y' || el.id === 'ruler_corner') {
                  return true
                }
                el = el.parentElement
              }
              return false
            }
            
            // Hook Canvas getContext 方法
            const originalGetContext = HTMLCanvasElement.prototype.getContext
            HTMLCanvasElement.prototype.getContext = function(type, ...args) {
              const context = originalGetContext.call(this, type, ...args)
              
              if (type === '2d' && context && isRulerCanvas(this)) {
                // 保存原始方法
                const originalFillText = context.fillText
                const originalStroke = context.stroke
                const originalFillRect = context.fillRect
                
                // Hook fillText - 确保文字是白色
                context.fillText = function(...args) {
                  const oldFillStyle = this.fillStyle
                  this.fillStyle = '#fff'
                  originalFillText.apply(this, args)
                  this.fillStyle = oldFillStyle
                }
                
                // Hook stroke - 确保线条是白色
                context.stroke = function() {
                  const oldStrokeStyle = this.strokeStyle
                  this.strokeStyle = '#fff'
                  originalStroke.apply(this, arguments)
                  this.strokeStyle = oldStrokeStyle
                }
                
                // Hook fillRect - 跳过背景填充（由CSS控制）
                context.fillRect = function(...args) {
                  // 不绘制背景，由CSS控制
                }
                
                // 设置默认颜色
                context.fillStyle = '#fff'
                context.strokeStyle = '#fff'
              }
              
              return context
            }
          })()
        `
        doc.head.appendChild(script)
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
