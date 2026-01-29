/**
 * SVG-Edit 图标 Patcher
 * 处理 Shadow DOM 内的图标颜色
 */

import { ENABLE_SVGEDIT_PATCH } from './svgeditSkinPatcher'

export const ENABLE_ICON_PATCH = true

/**
 * 给 Shadow DOM 内的 img 添加 filter 样式
 */
function applyFilterToShadowImg(shadowRoot: ShadowRoot, filter: string): void {
  const imgs = shadowRoot.querySelectorAll('img')
  imgs.forEach((img) => {
    img.style.filter = filter
    img.style.transition = 'filter 0.2s ease'
  })
}

/**
 * 移除 Shadow DOM 内 div 的背景色
 */
function removeShadowDivBackground(shadowRoot: ShadowRoot): void {
  const divs = shadowRoot.querySelectorAll('div')
  divs.forEach((div) => {
    // 移除背景色，设置为透明
    div.style.backgroundColor = 'transparent'
    div.style.background = 'transparent'
  })
}

/**
 * 监听按钮状态变化，更新图标颜色
 */
function watchButtonState(button: HTMLElement, doc: Document): void {
  const tagName = button.tagName.toLowerCase()
  // 检查是否是 se-button 或 se-flyingbutton
  if (tagName === 'se-button' || tagName === 'se-flyingbutton') {
    const shadowRoot = (button as any).shadowRoot
    if (shadowRoot) {
      // 蓝色 filter（浅色和深色模式都用蓝色）
      const blueFilter = 'brightness(0) saturate(100%) invert(48%) sepia(95%) saturate(2476%) hue-rotate(200deg) brightness(102%) contrast(101%)'
      
      // 默认状态：蓝色（无论浅色还是深色模式）
      applyFilterToShadowImg(shadowRoot, blueFilter)
      
      // 移除内部 div 的背景色
      removeShadowDivBackground(shadowRoot)
      
      // 如果是 se-flyingbutton，还需要处理内部的 se-button
      if (tagName === 'se-flyingbutton') {
        // 查找内部的 se-button 元素（在 Shadow DOM 内）
        const internalButtons = shadowRoot.querySelectorAll('se-button')
        internalButtons.forEach((internalBtn: HTMLElement) => {
          const internalShadowRoot = (internalBtn as any).shadowRoot
          if (internalShadowRoot) {
            applyFilterToShadowImg(internalShadowRoot, blueFilter)
            removeShadowDivBackground(internalShadowRoot)
          }
        })
      }
      
      // 监听 pressed 属性变化
      const observer = new MutationObserver(() => {
        const isPressed = button.hasAttribute('pressed')
        const isDisabled = button.hasAttribute('disabled')
        
        if (isDisabled) {
          applyFilterToShadowImg(shadowRoot, 'brightness(0) saturate(100%) invert(75%)')
        } else {
          // 无论是否选中，默认都是蓝色
          applyFilterToShadowImg(shadowRoot, blueFilter)
        }
        
        // 如果是 se-flyingbutton，更新内部的 se-button
        if (tagName === 'se-flyingbutton') {
          const internalButtons = shadowRoot.querySelectorAll('se-button')
          internalButtons.forEach((internalBtn: HTMLElement) => {
            const internalShadowRoot = (internalBtn as any).shadowRoot
            if (internalShadowRoot) {
              if (isDisabled) {
                applyFilterToShadowImg(internalShadowRoot, 'brightness(0) saturate(100%) invert(75%)')
              } else {
                applyFilterToShadowImg(internalShadowRoot, blueFilter)
              }
              removeShadowDivBackground(internalShadowRoot)
            }
          })
        }
      })
      
      observer.observe(button, {
        attributes: true,
        attributeFilter: ['pressed', 'disabled'],
      })
      
      // 监听 Shadow DOM 内部变化，确保背景始终透明
      const shadowObserver = new MutationObserver(() => {
        removeShadowDivBackground(shadowRoot)
        // 如果是 se-flyingbutton，也处理内部的 se-button
        if (tagName === 'se-flyingbutton') {
          const internalButtons = shadowRoot.querySelectorAll('se-button')
          internalButtons.forEach((internalBtn: HTMLElement) => {
            const internalShadowRoot = (internalBtn as any).shadowRoot
            if (internalShadowRoot) {
              removeShadowDivBackground(internalShadowRoot)
              applyFilterToShadowImg(internalShadowRoot, blueFilter)
            }
          })
        }
      })
      shadowObserver.observe(shadowRoot, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      })
      
      // 监听 hover（hover 时稍微变亮，但保持蓝色）
      button.addEventListener('mouseenter', () => {
        if (!button.hasAttribute('disabled')) {
          applyFilterToShadowImg(shadowRoot, blueFilter)
          const imgs = shadowRoot.querySelectorAll('img')
          imgs.forEach((img) => {
            img.style.opacity = '0.8'
          })
        }
      })
      
      button.addEventListener('mouseleave', () => {
        if (!button.hasAttribute('disabled')) {
          applyFilterToShadowImg(shadowRoot, blueFilter)
          const imgs = shadowRoot.querySelectorAll('img')
          imgs.forEach((img) => {
            img.style.opacity = '1'
          })
        }
      })
    }
  }
}

/**
 * Patch SVG-Edit 图标：处理 Shadow DOM 内的图标
 */
export function patchSvgEditIcons(doc: Document): void {
  if (!ENABLE_ICON_PATCH || !ENABLE_SVGEDIT_PATCH) {
    return
  }

  try {
    const uiRoot = doc.querySelector('.se-ui-root')
    if (!uiRoot) {
      return
    }
    
    // 查找所有 se-button 和 se-flyingbutton
    const seButtons = Array.from(uiRoot.querySelectorAll('se-button, se-flyingbutton')) as HTMLElement[]
    
    seButtons.forEach((button) => {
      watchButtonState(button, doc)
    })
    
    // 监听新添加的按钮
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const element = node as HTMLElement
            const tagName = element.tagName?.toLowerCase()
            if (tagName === 'se-button' || tagName === 'se-flyingbutton') {
              watchButtonState(element, doc)
            }
            // 检查子元素
            const childButtons = element.querySelectorAll?.('se-button, se-flyingbutton')
            childButtons?.forEach((btn) => watchButtonState(btn as HTMLElement, doc))
          }
        })
      })
    })
    
    observer.observe(uiRoot, {
      childList: true,
      subtree: true,
    })
    
    console.log(`[SVG-Edit Icon Patch] Patched ${seButtons.length} se-button icons`)
  } catch (error) {
    console.warn('[SVG-Edit Icon Patch] Error patching icons:', error)
  }
}

/**
 * 在 iframe 加载完成后执行图标 patch
 */
export async function patchIframeIcons(iframe: HTMLIFrameElement): Promise<void> {
  if (!ENABLE_ICON_PATCH) {
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

    setTimeout(() => {
      patchSvgEditIcons(doc)
    }, 500)
  } catch (error) {
    console.warn('[SVG-Edit Icon Patch] Cannot patch iframe icons:', error)
  }
}
