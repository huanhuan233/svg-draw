/**
 * SVG-Edit Shadow DOM 主题修复器
 * 专门处理 Web Components（se-explorerbutton, se-flyingbutton, se-zoom 等）的 Shadow DOM 主题
 */

import { ENABLE_SVGEDIT_PATCH } from './svgeditSkinPatcher'

export const ENABLE_SHADOW_THEME_PATCH = true

export type Theme = 'light' | 'dark'

/**
 * 生成 Shadow DOM 内注入的主题样式
 */
function generateShadowThemeStyles(theme: Theme): string {
  const blueFilter = 'brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%)'
  const disabledFilter = 'brightness(0) saturate(100%) invert(75%)'

  if (theme === 'light') {
    return `
      /* ========== 图标颜色 ========== */
      img {
        filter: ${blueFilter} !important;
        transition: filter 0.2s ease !important;
      }
      
      /* SVG 图标继承颜色 */
      svg, svg * {
        fill: currentColor !important;
        stroke: currentColor !important;
      }
      
      /* ========== 按钮状态 ========== */
      .menu-button,
      se-button {
        color: var(--se-icon, #409eff) !important;
        background-color: transparent !important;
        background: transparent !important;
      }
      
      .menu-button:hover,
      se-button:hover {
        color: var(--se-icon-hover, #409eff) !important;
        background-color: transparent !important;
      }
      
      .menu-button.pressed,
      .overall.pressed .menu-button,
      se-button[pressed] {
        color: var(--se-icon-active, #409eff) !important;
        background-color: transparent !important;
        border-color: var(--se-primary, #409eff) !important;
      }
      
      .disabled,
      se-button[disabled] {
        color: var(--se-icon-disabled, #c0c4cc) !important;
        opacity: 0.5 !important;
      }
      
      .disabled img,
      se-button[disabled] img {
        filter: ${disabledFilter} !important;
      }
      
      /* ========== 面板/菜单背景 ========== */
      .menu,
      .image-lib,
      .overall,
      #options-container {
        background: var(--se-panel, #ffffff) !important;
        background-color: var(--se-panel, #ffffff) !important;
        border: 1px solid var(--se-border, #dcdfe6) !important;
        border-radius: var(--se-radius-md, 4px) !important;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1) !important;
      }
      
      .menu-item,
      [aria-label="option"] {
        background-color: transparent !important;
        background: transparent !important;
        color: var(--se-primary, #409eff) !important; /* 未选中时：蓝色文字 */
        border-color: var(--se-border-lighter, #e4e7ed) !important;
      }
      
      .menu-item:hover,
      [aria-label="option"]:hover {
        background-color: var(--se-primary-weak, #ecf5ff) !important;
        color: var(--se-primary, #409eff) !important;
      }
      
      .menu-item.pressed,
      .menu-item.selected,
      [aria-label="option"].pressed,
      [aria-label="option"].selected {
        background-color: var(--se-primary, #409eff) !important; /* 选中后：蓝底 */
        color: #ffffff !important; /* 选中后：白字 */
      }
      
      /* ========== 移除深色背景 ========== */
      div {
        background-color: transparent !important;
        background: transparent !important;
      }
      
      /* 特殊：se-explorerbutton 的 image-lib 区域 */
      .image-lib {
        background-color: var(--se-panel, #ffffff) !important;
        border: 1px solid var(--se-border, #dcdfe6) !important;
        border-radius: var(--se-radius-md, 4px) !important;
      }
      
      /* ========== 选中框颜色（浅色模式：蓝色） ========== */
      .overall.pressed,
      se-button[pressed] {
        border-color: var(--se-primary, #409eff) !important;
      }
      
      /* ========== se-zoom 和 se-list 的 slot 内容样式 ========== */
      ::slotted(*) {
        color: var(--se-primary, #409eff) !important; /* 未选中时：蓝色文字 */
        background-color: transparent !important;
        background: transparent !important;
      }
      
      ::slotted(*:hover) {
        background-color: var(--se-primary-weak, #ecf5ff) !important;
        color: var(--se-primary, #409eff) !important;
      }
      
      /* 注意：选中状态需要在 se-list-item 的 Shadow DOM 内部处理 */
      /* 因为 ::slotted() 无法访问 slot 内容内部的 Shadow DOM */
    `
  } else {
    // 深色模式
    return `
      /* ========== 图标颜色 ========== */
      img {
        filter: ${blueFilter} !important;
        transition: filter 0.2s ease !important;
      }
      
      /* SVG 图标继承颜色 */
      svg, svg * {
        fill: currentColor !important;
        stroke: currentColor !important;
      }
      
      /* ========== 按钮状态 ========== */
      .menu-button,
      se-button {
        color: var(--se-icon, #409eff) !important;
        background-color: transparent !important;
        background: transparent !important;
      }
      
      .menu-button:hover,
      se-button:hover {
        color: var(--se-icon-hover, #409eff) !important;
        background-color: transparent !important;
      }
      
      .menu-button.pressed,
      .overall.pressed .menu-button,
      se-button[pressed] {
        color: var(--se-icon-active, #409eff) !important;
        background-color: transparent !important;
        border-color: #ffffff !important; /* 深色模式：白色边框 */
      }
      
      .disabled,
      se-button[disabled] {
        color: var(--se-icon-disabled, #c0c4cc) !important;
        opacity: 0.5 !important;
      }
      
      .disabled img,
      se-button[disabled] img {
        filter: ${disabledFilter} !important;
      }
      
      /* ========== 面板/菜单背景 ========== */
      .menu,
      .image-lib,
      .overall,
      #options-container {
        background: var(--se-panel, #1d1e1f) !important;
        background-color: var(--se-panel, #1d1e1f) !important;
        border: 1px solid var(--se-border-dark, #4c4d4f) !important;
        border-radius: var(--se-radius-md, 4px) !important;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3) !important;
      }
      
      .menu-item,
      [aria-label="option"] {
        background-color: transparent !important;
        background: transparent !important;
        color: var(--se-primary, #409eff) !important; /* 未选中时：蓝色文字 */
        border-color: var(--se-border-dark, #4c4d4f) !important;
      }
      
      .menu-item:hover,
      [aria-label="option"]:hover {
        background-color: rgba(64, 158, 255, 0.1) !important;
        color: var(--se-primary, #409eff) !important;
      }
      
      .menu-item.pressed,
      .menu-item.selected,
      [aria-label="option"].pressed,
      [aria-label="option"].selected {
        background-color: var(--se-primary, #409eff) !important; /* 选中后：蓝底 */
        color: #ffffff !important; /* 选中后：白字 */
      }
      
      /* ========== 移除深色背景 ========== */
      div {
        background-color: transparent !important;
        background: transparent !important;
      }
      
      /* 特殊：se-explorerbutton 的 image-lib 区域 */
      .image-lib {
        background-color: var(--se-panel, #1d1e1f) !important;
        border: 1px solid var(--se-border-dark, #4c4d4f) !important;
        border-radius: var(--se-radius-md, 4px) !important;
      }
      
      /* ========== 选中框颜色（深色模式：白色） ========== */
      .overall.pressed,
      se-button[pressed] {
        border-color: #ffffff !important;
      }
      
      /* ========== se-zoom 和 se-list 的 slot 内容样式 ========== */
      ::slotted(*) {
        color: var(--se-primary, #409eff) !important; /* 未选中时：蓝色文字 */
        background-color: transparent !important;
        background: transparent !important;
      }
      
      ::slotted(*:hover) {
        background-color: rgba(64, 158, 255, 0.1) !important;
        color: var(--se-primary, #409eff) !important;
      }
      
      /* 注意：选中状态需要在 se-list-item 的 Shadow DOM 内部处理 */
      /* 因为 ::slotted() 无法访问 slot 内容内部的 Shadow DOM */
    `
  }
}

/**
 * 处理 ShapeLibrary（se-explorerbutton）的特殊逻辑
 * 将 base64 SVG img 转换为 inline SVG，以便使用 currentColor
 */
function patchShapeLibrarySvgs(shadowRoot: ShadowRoot): number {
  let patchedCount = 0
  
  try {
    // 查找所有 data:image/svg+xml 的 img 标签
    const imgs = shadowRoot.querySelectorAll('img[src^="data:image/svg+xml"]') as NodeListOf<HTMLImageElement>
    
    imgs.forEach((img) => {
      try {
        // 跳过已经转换过的 SVG（通过检查是否有 data-se-patched 属性）
        if (img.hasAttribute('data-se-patched')) {
          return
        }
        
        const dataUrl = img.getAttribute('src')
        if (!dataUrl || !dataUrl.startsWith('data:image/svg+xml')) {
          return
        }
        
        // 提取 base64 部分
        const base64Match = dataUrl.match(/data:image\/svg\+xml;base64,(.+)/)
        if (!base64Match) {
          return
        }
        
        // 解码 base64
        const svgText = atob(base64Match[1])
        
        // 解析 SVG（使用 ShadowRoot 的 ownerDocument）
        const ownerDoc = shadowRoot.ownerDocument || document
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
        const svgElement = svgDoc.documentElement
        
        // 检查解析是否成功
        if (svgElement.tagName.toLowerCase() !== 'svg') {
          return
        }
        
        // 移除硬编码的 fill/stroke，设置为 currentColor
        const allPaths = svgElement.querySelectorAll('*')
        allPaths.forEach((el) => {
          if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
            el.setAttribute('fill', 'currentColor')
          }
          if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke', 'currentColor')
          }
        })
        
        // 确保根 SVG 也使用 currentColor
        if (!svgElement.hasAttribute('fill') || svgElement.getAttribute('fill') !== 'none') {
          svgElement.setAttribute('fill', 'currentColor')
        }
        
        // 设置 SVG 尺寸（从原 img 继承）
        const imgWidth = img.width || 24
        const imgHeight = img.height || 24
        svgElement.setAttribute('width', String(imgWidth))
        svgElement.setAttribute('height', String(imgHeight))
        svgElement.setAttribute('style', 'width: 100%; height: 100%;')
        
        // 创建新的 SVG 元素（使用 ShadowRoot 的 ownerDocument）
        const newSvg = ownerDoc.createElementNS('http://www.w3.org/2000/svg', 'svg')
        Array.from(svgElement.attributes).forEach((attr) => {
          newSvg.setAttribute(attr.name, attr.value)
        })
        Array.from(svgElement.childNodes).forEach((child) => {
          // 使用 importNode 将节点导入到正确的文档
          const imported = ownerDoc.importNode(child, true)
          newSvg.appendChild(imported)
        })
        
        // 标记为已处理
        newSvg.setAttribute('data-se-patched', 'true')
        
        // 替换 img 为 inline SVG
        if (img.parentNode) {
          img.parentNode.replaceChild(newSvg, img)
          patchedCount++
        }
      } catch (error) {
        // 单个 img 转换失败不影响其他
        console.warn('[Shadow Theme Patch] Failed to convert img to inline SVG:', error)
      }
    })
  } catch (error) {
    console.warn('[Shadow Theme Patch] Error patching ShapeLibrary SVGs:', error)
  }
  
  return patchedCount
}

/**
 * 在单个 ShadowRoot 内注入主题样式
 */
function injectShadowTheme(shadowRoot: ShadowRoot, theme: Theme): void {
  const styleId = 'se-shadow-theme'
  
  // 查找或创建 style 元素
  let styleEl = shadowRoot.getElementById(styleId) as HTMLStyleElement | null
  
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = styleId
    shadowRoot.appendChild(styleEl)
  }
  
  // 更新样式内容
  styleEl.textContent = generateShadowThemeStyles(theme)
}

/**
 * 处理单个 Web Component 的 Shadow DOM
 */
function patchComponentShadowDom(
  element: HTMLElement,
  theme: Theme,
  doc: Document
): { shadowRootsPatched: number; svgsPatched: number } {
  let shadowRootsPatched = 0
  let svgsPatched = 0
  
  try {
    const shadowRoot = (element as any).shadowRoot as ShadowRoot | null
    
    if (!shadowRoot) {
      return { shadowRootsPatched: 0, svgsPatched: 0 }
    }
    
    // 检查 Shadow DOM 模式（只处理 open）
    // 注意：无法直接检查 mode，但可以通过能否访问 shadowRoot 判断
    // 如果能访问到 shadowRoot，说明是 open 模式
    
    // 注入主题样式
    injectShadowTheme(shadowRoot, theme)
    shadowRootsPatched++
    
    // 特殊处理：如果是 se-explorerbutton，处理 ShapeLibrary SVG
    const tagName = element.tagName.toLowerCase()
    if (tagName === 'se-explorerbutton') {
      const count = patchShapeLibrarySvgs(shadowRoot)
      svgsPatched += count
      
      // 监听 Shadow DOM 变化，处理动态添加的 SVG
      // 使用闭包保存当前 theme，确保后续更新使用正确的主题
      let currentTheme = theme
      const observer = new MutationObserver(() => {
        const newCount = patchShapeLibrarySvgs(shadowRoot)
        if (newCount > 0) {
          svgsPatched += newCount
          // 重新注入样式，确保新元素也被正确样式化
          injectShadowTheme(shadowRoot, currentTheme)
        }
      })
      
      observer.observe(shadowRoot, {
        childList: true,
        subtree: true,
      })
      
      // 存储 observer 和 theme updater 到元素上
      ;(element as any)._shadowThemeObserver = observer
      ;(element as any)._updateShadowTheme = (newTheme: Theme) => {
        currentTheme = newTheme
        injectShadowTheme(shadowRoot, newTheme)
      }
    }
    
    // 递归处理 Shadow DOM 内的其他 Web Components
    const nestedComponents = shadowRoot.querySelectorAll('se-button, se-flyingbutton, se-explorerbutton, se-zoom, se-select, se-list, se-list-item') as NodeListOf<HTMLElement>
    nestedComponents.forEach((nested) => {
      const result = patchComponentShadowDom(nested, theme, doc)
      shadowRootsPatched += result.shadowRootsPatched
      svgsPatched += result.svgsPatched
    })
  } catch (error) {
    console.warn(`[Shadow Theme Patch] Error patching component ${element.tagName}:`, error)
  }
  
  return { shadowRootsPatched, svgsPatched }
}

/**
 * Patch SVG-Edit Shadow DOM 主题
 * @param doc - iframe 的 document
 * @param theme - 主题类型
 */
export function patchSvgEditShadowThemes(doc: Document, theme: Theme): void {
  if (!ENABLE_SHADOW_THEME_PATCH || !ENABLE_SVGEDIT_PATCH) {
    return
  }

  try {
    // 查找所有 Web Components
    const components = Array.from(
      doc.querySelectorAll('se-explorerbutton, se-flyingbutton, se-zoom, se-button, se-select, se-list, se-list-item')
    ) as HTMLElement[]
    
    if (components.length === 0) {
      return
    }
    
    let totalShadowRootsPatched = 0
    let totalSvgsPatched = 0
    
    components.forEach((component) => {
      // 如果组件已有主题更新函数，直接调用（用于主题切换）
      const updateTheme = (component as any)._updateShadowTheme
      if (updateTheme && typeof updateTheme === 'function') {
        updateTheme(theme)
        totalShadowRootsPatched++
        return
      }
      
      // 否则进行完整 patch
      const result = patchComponentShadowDom(component, theme, doc)
      totalShadowRootsPatched += result.shadowRootsPatched
      totalSvgsPatched += result.svgsPatched
    })
    
    console.log(
      `[SVG-Edit Shadow Theme Patch] Theme: ${theme}, ` +
      `Patched ${totalShadowRootsPatched} ShadowRoot(s), ` +
      `Converted ${totalSvgsPatched} ShapeLibrary SVG(s)`
    )
  } catch (error) {
    console.warn('[SVG-Edit Shadow Theme Patch] Error patching Shadow DOM themes:', error)
  }
}

/**
 * 在 iframe 加载完成后执行 Shadow DOM 主题 patch
 */
export async function patchIframeShadowThemes(
  iframe: HTMLIFrameElement,
  theme: Theme
): Promise<void> {
  if (!ENABLE_SHADOW_THEME_PATCH) {
    return
  }

  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) {
      throw new Error('Cannot access iframe contentDocument')
    }

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

    // 延迟执行，确保 Web Components 已初始化
    setTimeout(() => {
      patchSvgEditShadowThemes(doc, theme)
      
      // 监听新添加的 Web Components
      const observer = new MutationObserver(() => {
        patchSvgEditShadowThemes(doc, theme)
      })
      
      observer.observe(doc.body || doc.documentElement, {
        childList: true,
        subtree: true,
      })
      
      // 存储 observer（可选，用于清理）
      ;(doc as any)._shadowThemeObserver = observer
    }, 800) // 延迟稍长，确保 se-explorerbutton 已加载数据
  } catch (error) {
    console.warn('[SVG-Edit Shadow Theme Patch] Cannot patch iframe Shadow DOM themes:', error)
  }
}
