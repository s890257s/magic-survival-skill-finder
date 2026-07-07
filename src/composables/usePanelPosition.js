import { ref } from 'vue'

// 下拉面板定位：以 fixed 座標貼齊觸發鈕，下方空間不足時向上翻轉。
// matchWidth：面板寬度是否對齊觸發鈕（icon 按鈕型觸發鈕應關閉）
// align：'start' 對齊左緣、'end' 對齊右緣
export function usePanelPosition(triggerRef, { panelMaxHeight = 300, matchWidth = true, align = 'start' } = {}) {
  const panelStyle = ref({})

  const positionPanel = () => {
    const rect = triggerRef.value?.getBoundingClientRect()
    if (!rect) return
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < panelMaxHeight && rect.top > spaceBelow
    panelStyle.value = {
      position: 'fixed',
      ...(matchWidth ? { width: `${rect.width}px` } : {}),
      ...(align === 'end'
        ? { right: `${window.innerWidth - rect.right}px` }
        : { left: `${rect.left}px` }),
      ...(openUp
        ? { bottom: `${window.innerHeight - rect.top + 4}px` }
        : { top: `${rect.bottom + 4}px` }),
    }
  }

  return { panelStyle, positionPanel }
}
