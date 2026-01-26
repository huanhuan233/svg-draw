/**
 * SVG-Edit Bridge Script
 * 用于与父页面通信，支持导入 SVG
 */

(function() {
  'use strict'

  // 等待 SVG-Edit 编辑器初始化完成
  let editorReady = false
  let svgEditor = null

  // 监听编辑器初始化
  const checkEditorReady = () => {
    // 尝试从全局获取编辑器实例
    // SVG-Edit 可能将编辑器实例挂载在 window 上
    if (window.svgEditor || window.editor) {
      svgEditor = window.svgEditor || window.editor
      editorReady = true
      sendReadyMessage()
      
      // 尝试访问 canvas 对象并验证方法
      const canvas = svgEditor?.canvas || svgEditor?.svgCanvas
      if (canvas) {
        console.log('[SVG-Edit Bridge] Canvas found, setSvgString available:', typeof canvas.setSvgString === 'function')
      }
    } else {
      // 延迟重试
      setTimeout(checkEditorReady, 100)
    }
  }

  // 发送 READY 消息给父页面
  const sendReadyMessage = () => {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'READY',
          source: 'svgedit-bridge'
        },
        '*'
      )
      console.log('[SVG-Edit Bridge] READY message sent')
    }
  }

  // 监听来自父页面的消息
  const handleMessage = (event) => {
    // 安全检查：只处理来自同源的消息
    // 在生产环境中应该检查 event.origin
    if (event.data?.type === 'IMPORT_SVG') {
      console.log('[SVG-Edit Bridge] Received IMPORT_SVG:', event.data.svg)
      importSvg(event.data.svg)
    } else if (event.data?.type === 'FIT_TO_SCREEN') {
      console.log('[SVG-Edit Bridge] Received FIT_TO_SCREEN')
      fitToScreen()
    }
  }

  // 滚动到内容区域（辅助函数）
  const scrollToContent = (container) => {
    try {
      const svgCanvas = container.querySelector('svg')
      if (!svgCanvas) return

      // 获取所有可见元素的边界
      const allElements = svgCanvas.querySelectorAll('*')
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      let hasValidBBox = false

      allElements.forEach((elem) => {
        try {
          const bbox = elem.getBBox()
          if (bbox && bbox.width > 0 && bbox.height > 0) {
            minX = Math.min(minX, bbox.x)
            minY = Math.min(minY, bbox.y)
            maxX = Math.max(maxX, bbox.x + bbox.width)
            maxY = Math.max(maxY, bbox.y + bbox.height)
            hasValidBBox = true
          }
        } catch (e) {
          // 某些元素可能没有 getBBox
        }
      })

      if (!hasValidBBox) {
        // 如果无法获取元素边界，尝试使用 SVG 本身的边界
        try {
          const bbox = svgCanvas.getBBox()
          if (bbox && bbox.width > 0 && bbox.height > 0) {
            minX = bbox.x
            minY = bbox.y
            maxX = bbox.x + bbox.width
            maxY = bbox.y + bbox.height
            hasValidBBox = true
          }
        } catch (e) {
          console.warn('[SVG-Edit Bridge] Cannot get SVG bbox:', e)
        }
      }

      if (hasValidBBox) {
        setTimeout(() => {
          const contentWidth = maxX - minX
          const contentHeight = maxY - minY
          const centerX = (minX + maxX) / 2
          const centerY = (minY + maxY) / 2

          // 滚动容器
          if (container.scrollTo) {
            container.scrollTo({
              left: Math.max(0, centerX - container.clientWidth / 2),
              top: Math.max(0, centerY - container.clientHeight / 2),
              behavior: 'smooth'
            })
          } else if (container.scrollLeft !== undefined) {
            container.scrollLeft = Math.max(0, centerX - container.clientWidth / 2)
            container.scrollTop = Math.max(0, centerY - container.clientHeight / 2)
          }

          // 如果内容超出右侧，额外滚动
          if (maxX > container.clientWidth) {
            setTimeout(() => {
              if (container.scrollTo) {
                container.scrollTo({
                  left: Math.max(0, maxX - container.clientWidth + 50),
                  behavior: 'smooth'
                })
              } else if (container.scrollLeft !== undefined) {
                container.scrollLeft = Math.max(0, maxX - container.clientWidth + 50)
              }
            }, 300)
          }
        }, 200)
      }
    } catch (error) {
      console.warn('[SVG-Edit Bridge] Error scrolling to content:', error)
    }
  }

  // 适应屏幕大小
  const fitToScreen = () => {
    try {
      const container = document.getElementById('container')
      if (!container) {
        console.warn('[SVG-Edit Bridge] Container not found')
        return
      }

      // 等待一下确保 SVG 已渲染，并且 SVG-Edit 的 DOM 元素都已准备好
      // 需要等待更长时间，确保 canvasBackground 等元素已创建
      // 使用更长的延迟，并检查元素是否存在
      const checkAndFit = () => {
        const canvasBackground = document.getElementById('canvasBackground')
        if (!canvasBackground) {
          // 如果元素还不存在，再等一会儿
          setTimeout(checkAndFit, 200)
          return
        }
        
        // 元素已准备好，执行适应屏幕逻辑
        setTimeout(() => {
        try {
          // 方法1: 优先尝试查找并点击 SVG-Edit 的"适应屏幕"按钮（最安全）
          const fitButtons = Array.from(document.querySelectorAll('button, [role="button"], [title*="fit"], [title*="适应"], [title*="zoom"], [title*="缩放"]')).filter(btn => {
            const text = (btn.textContent || btn.title || btn.getAttribute('aria-label') || '').toLowerCase()
            return /fit|适应|zoom|缩放|view|视图/i.test(text)
          })
          
          if (fitButtons.length > 0) {
            try {
              fitButtons[0].click()
              console.log('[SVG-Edit Bridge] Fit button clicked')
              // 点击后等待一下，然后滚动确保内容可见
              setTimeout(() => {
                scrollToContent(container)
              }, 500)
              return
            } catch (e) {
              console.warn('[SVG-Edit Bridge] Error clicking fit button:', e)
            }
          }

          // 方法2: 尝试使用 Editor 的 fitToScreen 方法（如果存在）
          if (svgEditor && typeof svgEditor.fitToScreen === 'function') {
            try {
              svgEditor.fitToScreen()
              console.log('[SVG-Edit Bridge] fitToScreen called')
              setTimeout(() => {
                scrollToContent(container)
              }, 300)
              return
            } catch (e) {
              console.warn('[SVG-Edit Bridge] Error calling fitToScreen:', e)
            }
          }

          // 方法3: 尝试使用 SVG-Edit Editor 的 API（谨慎使用，可能出错）
          if (svgEditor) {
            // 尝试访问 canvas 对象
            const canvas = svgEditor.canvas || svgEditor.svgCanvas
            
            if (canvas) {
              // 尝试获取所有元素的边界框
              const allElements = container.querySelectorAll('svg > *')
              if (allElements.length > 0) {
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                
                allElements.forEach((elem) => {
                  try {
                    const bbox = elem.getBBox()
                    if (bbox && bbox.width > 0 && bbox.height > 0) {
                      minX = Math.min(minX, bbox.x)
                      minY = Math.min(minY, bbox.y)
                      maxX = Math.max(maxX, bbox.x + bbox.width)
                      maxY = Math.max(maxY, bbox.y + bbox.height)
                    }
                  } catch (e) {
                    // 某些元素可能没有 getBBox
                  }
                })
                
                if (minX !== Infinity && maxX !== -Infinity) {
                  const contentWidth = maxX - minX
                  const contentHeight = maxY - minY
                  const containerRect = container.getBoundingClientRect()
                  
                  // 计算合适的缩放比例，确保内容完全可见
                  const scaleX = (containerRect.width * 0.9) / contentWidth
                  const scaleY = (containerRect.height * 0.9) / contentHeight
                  const scale = Math.min(scaleX, scaleY, 1)
                  
                  // 禁用 setZoom 调用，因为它可能导致 SVG-Edit 内部错误
                  // 只使用滚动来确保内容可见
                  console.log('[SVG-Edit Bridge] Using scroll-only approach to avoid setZoom errors')
                  scrollToContent(container)
                  return
                }
              }
            }
            
            // 方法4: 尝试使用 zoom 方法（需要验证缩放值，可能出错）
            if (typeof svgEditor.zoom === 'function') {
              const svgCanvas = container.querySelector('svg')
              if (svgCanvas) {
                try {
                  const bbox = svgCanvas.getBBox()
                  if (bbox && bbox.width > 0 && bbox.height > 0) {
                    const containerRect = container.getBoundingClientRect()
                    const scaleX = containerRect.width / bbox.width
                    const scaleY = containerRect.height / bbox.height
                    const scale = Math.min(scaleX, scaleY, 0.85) // 85% 以确保内容完全可见
                    
                    // 禁用 zoom 调用，因为它可能导致 SVG-Edit 内部错误
                    // 只使用滚动来确保内容可见
                    console.log('[SVG-Edit Bridge] Using scroll-only approach to avoid zoom errors')
                    scrollToContent(container)
                    return
                  }
                } catch (e) {
                  console.warn('[SVG-Edit Bridge] Error getting bbox for zoom:', e)
                }
              }
            }
          }

          // 方法5: 最后尝试直接滚动（不改变缩放，只滚动到可见区域）
          scrollToContent(container)

        } catch (error) {
          console.warn('[SVG-Edit Bridge] Error in fitToScreen:', error)
        }
        }, 100)
      }
      
      // 开始检查
      checkAndFit()
    } catch (error) {
      console.warn('[SVG-Edit Bridge] Error fitting to screen:', error)
    }
  }

  // 导入 SVG
  const importSvg = (svgText) => {
    if (!svgText) {
      console.warn('[SVG-Edit Bridge] Empty SVG text')
      return
    }

    try {
      // 方法1: 尝试使用 svgCanvas.setSvgString (最正确的方法)
      if (svgEditor) {
        const canvas = svgEditor.canvas || svgEditor.svgCanvas
        if (canvas && typeof canvas.setSvgString === 'function') {
          try {
            const success = canvas.setSvgString(svgText, false)
            if (success) {
              console.log('[SVG-Edit Bridge] SVG imported via setSvgString')
              // 导入后自动调整视图
              adjustViewAfterImport()
              return
            } else {
              console.warn('[SVG-Edit Bridge] setSvgString returned false')
            }
          } catch (e) {
            console.warn('[SVG-Edit Bridge] Error calling setSvgString:', e)
          }
        }
      }

      // 方法2: 尝试使用 Editor 的 importSvg 方法
      if (svgEditor && typeof svgEditor.importSvg === 'function') {
        try {
          svgEditor.importSvg(svgText)
          console.log('[SVG-Edit Bridge] SVG imported via svgEditor.importSvg')
          adjustViewAfterImport()
          return
        } catch (e) {
          console.warn('[SVG-Edit Bridge] Error calling svgEditor.importSvg:', e)
        }
      }

      // 方法3: 尝试使用文件打开功能（通过文件输入）
      // 查找文件输入元素并模拟文件选择
      const fileInput = document.querySelector('input[type="file"][accept*="svg"]') ||
                        document.querySelector('input[type="file"]')
      
      if (fileInput) {
        try {
          const blob = new Blob([svgText], { type: 'image/svg+xml' })
          const file = new File([blob], 'import.svg', { type: 'image/svg+xml' })
          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(file)
          fileInput.files = dataTransfer.files
          
          // 触发 change 事件
          const event = new Event('change', { bubbles: true })
          fileInput.dispatchEvent(event)
          
          console.log('[SVG-Edit Bridge] SVG imported via file input')
          adjustViewAfterImport()
          return
        } catch (e) {
          console.warn('[SVG-Edit Bridge] Error using file input:', e)
        }
      }

      // 方法4: 尝试使用 Editor 的 open 方法
      if (svgEditor && typeof svgEditor.open === 'function') {
        try {
          const blob = new Blob([svgText], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          svgEditor.open(url)
          // 清理 URL
          setTimeout(() => URL.revokeObjectURL(url), 1000)
          console.log('[SVG-Edit Bridge] SVG imported via svgEditor.open')
          adjustViewAfterImport()
          return
        } catch (e) {
          console.warn('[SVG-Edit Bridge] Error calling svgEditor.open:', e)
        }
      }

      // 方法5: 尝试查找并点击"打开文件"按钮，然后使用剪贴板
      // 这是一个备选方案，可能不太可靠
      const openButtons = Array.from(document.querySelectorAll('button, [role="button"]')).filter(btn => {
        const text = (btn.textContent || btn.title || btn.getAttribute('aria-label') || '').toLowerCase()
        return /open|打开|file|文件/i.test(text)
      })

      if (openButtons.length > 0) {
        console.warn('[SVG-Edit Bridge] Found open button but file input method failed')
      }

      console.error('[SVG-Edit Bridge] Could not import SVG - no working method found')
      console.error('[SVG-Edit Bridge] Available methods checked:')
      console.error('[SVG-Edit Bridge] - svgEditor:', !!svgEditor)
      console.error('[SVG-Edit Bridge] - canvas.setSvgString:', !!(svgEditor?.canvas?.setSvgString))
      console.error('[SVG-Edit Bridge] - svgEditor.importSvg:', !!(svgEditor?.importSvg))
      console.error('[SVG-Edit Bridge] - fileInput:', !!fileInput)
      console.error('[SVG-Edit Bridge] - svgEditor.open:', !!(svgEditor?.open))
      
      alert('无法导入 SVG：找不到可用的导入方法。\n\n请检查 SVG-Edit 是否正确初始化。')

    } catch (error) {
      console.error('[SVG-Edit Bridge] Error importing SVG:', error)
      alert('导入 SVG 时发生错误：' + error.message)
    }
  }

  // 导入后调整视图，确保内容完全可见
  const adjustViewAfterImport = () => {
    // 延迟执行，确保 SVG 已完全渲染，并且 SVG-Edit 的内部状态已更新
    // 使用较长的延迟，确保所有 DOM 元素都已准备好
    setTimeout(() => {
      try {
        // 只使用滚动，不尝试缩放，避免触发 SVG-Edit 内部错误
        const container = document.getElementById('container')
        if (container) {
          scrollToContent(container)
        }
      } catch (error) {
        console.warn('[SVG-Edit Bridge] Error adjusting view:', error)
      }
    }, 1000) // 增加延迟，确保 SVG-Edit 完全准备好
  }

  // 初始化
  window.addEventListener('message', handleMessage)
  
  // 等待页面加载完成后检查编辑器
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkEditorReady)
  } else {
    // 延迟一下，确保 SVG-Edit 已经初始化
    setTimeout(checkEditorReady, 500)
  }

  // 也监听 window.load 事件
  window.addEventListener('load', () => {
    setTimeout(checkEditorReady, 1000)
  })

  console.log('[SVG-Edit Bridge] Initialized')
})()
