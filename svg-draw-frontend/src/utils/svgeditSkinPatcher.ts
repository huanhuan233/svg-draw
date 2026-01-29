/**
 * SVG-Edit DOM Patcher
 * 用于给 SVG-Edit 的关键 DOM 节点添加稳定的 class，便于 CSS 选择器命中
 * 仅在宿主侧注入，不修改 SVG-Edit 源码
 */

/**
 * 配置：是否启用 DOM patch
 * 设置为 false 可关闭 patch（仅使用 CSS 选择器）
 */
export const ENABLE_SVGEDIT_PATCH = true

/**
 * 给 SVG-Edit DOM 添加辅助 class
 * @param doc - iframe 的 document 对象
 */
export function patchSvgEditDom(doc: Document): void {
  if (!ENABLE_SVGEDIT_PATCH) {
    return
  }

  try {
    // 1. 顶部工具栏
    const toolsTop = doc.getElementById('tools_top')
    if (toolsTop && !toolsTop.classList.contains('se-toolbar')) {
      toolsTop.classList.add('se-toolbar')
    }

    // 2. 左侧工具栏
    const toolsLeft = doc.getElementById('tools_left')
    if (toolsLeft && !toolsLeft.classList.contains('se-left-tools')) {
      toolsLeft.classList.add('se-left-tools')
    }

    // 3. 底部工具栏
    const toolsBottom = doc.getElementById('tools_bottom')
    if (toolsBottom && !toolsBottom.classList.contains('se-toolbar')) {
      toolsBottom.classList.add('se-toolbar')
    }

    // 4. 右侧面板容器
    const sidepanels = doc.getElementById('sidepanels')
    if (sidepanels && !sidepanels.classList.contains('se-panels')) {
      sidepanels.classList.add('se-panels')
    }

    // 5. 主容器
    const svgEditor = doc.querySelector('.svg_editor')
    if (svgEditor && !svgEditor.classList.contains('se-editor-root')) {
      svgEditor.classList.add('se-editor-root')
    }

    // 6. 工作区
    const workarea = doc.getElementById('workarea')
    if (workarea && !workarea.classList.contains('se-workarea')) {
      workarea.classList.add('se-workarea')
    }

    // 7. 主菜单（下拉菜单）
    const mainMenu = doc.getElementById('main_menu')
    if (mainMenu && !mainMenu.classList.contains('se-dropdown-menu')) {
      mainMenu.classList.add('se-dropdown-menu')
    }

    // 8. 所有下拉菜单 ul
    const dropdowns = doc.querySelectorAll('.dropdown ul')
    dropdowns.forEach((ul) => {
      if (!ul.classList.contains('se-dropdown-menu')) {
        ul.classList.add('se-dropdown-menu')
      }
    })

    // 9. 对话框/弹窗（如果存在）
    const dialogs = doc.querySelectorAll('[role="dialog"], .dialog, .modal')
    dialogs.forEach((dialog) => {
      if (!dialog.classList.contains('se-dialog-root')) {
        dialog.classList.add('se-dialog-root')
      }
    })

    // 10. 图层面板
    const layerpanel = doc.getElementById('layerpanel')
    if (layerpanel && !layerpanel.classList.contains('se-panel')) {
      layerpanel.classList.add('se-panel')
    }

    // 11. 上下文面板
    const contextPanel = doc.getElementById('cur_context_panel')
    if (contextPanel && !contextPanel.classList.contains('se-context-panel')) {
      contextPanel.classList.add('se-context-panel')
    }

    console.log('[SVG-Edit Patch] DOM patching completed')
  } catch (error) {
    // 容错：节点找不到就跳过，不报错
    console.warn('[SVG-Edit Patch] Error patching DOM (non-fatal):', error)
  }
}

/**
 * 在 iframe 加载完成后执行 patch
 * @param iframe - SVG-Edit iframe 元素
 */
export async function patchIframeDom(iframe: HTMLIFrameElement): Promise<void> {
  if (!ENABLE_SVGEDIT_PATCH) {
    return
  }

  try {
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

    // 延迟一下，确保 SVG-Edit 已经初始化 DOM
    setTimeout(() => {
      patchSvgEditDom(doc)
    }, 100)
  } catch (error) {
    console.warn('[SVG-Edit Patch] Cannot patch iframe DOM (cross-origin or access denied):', error)
  }
}
