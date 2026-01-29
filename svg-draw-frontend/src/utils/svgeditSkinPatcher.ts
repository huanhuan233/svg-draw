/**
 * SVG-Edit DOM Patcher
 */

export const ENABLE_SVGEDIT_PATCH = true

export function patchSvgEditDom(doc: Document): void {
  if (!ENABLE_SVGEDIT_PATCH) {
    return
  }

  try {
    const svgEditor = doc.querySelector('.svg_editor')
    if (svgEditor && !svgEditor.classList.contains('se-ui-root')) {
      svgEditor.classList.add('se-ui-root')
    }
  } catch (error) {
    console.warn('[SVG-Edit Patch] Error patching DOM:', error)
  }
}

export async function patchIframeDom(iframe: HTMLIFrameElement): Promise<void> {
  if (!ENABLE_SVGEDIT_PATCH) {
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
      patchSvgEditDom(doc)
    }, 100)
  } catch (error) {
    console.warn('[SVG-Edit Patch] Cannot patch iframe DOM:', error)
  }
}
