import { ref } from 'vue'
import { usePanelPosition } from '@/composables/usePanelPosition'

// 下拉面板的開關狀態機：triggerRef 綁觸發鈕、panelStyle 給 DropdownPanel 定位。
// positionOptions 直接轉交 usePanelPosition（matchWidth / align 等）
export function useDropdown(positionOptions = {}) {
  const isOpen = ref(false)
  const triggerRef = ref(null)
  const { panelStyle, positionPanel } = usePanelPosition(triggerRef, positionOptions)

  const close = () => {
    isOpen.value = false
  }

  const open = () => {
    positionPanel()
    isOpen.value = true
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  return { isOpen, triggerRef, panelStyle, open, close, toggle }
}
