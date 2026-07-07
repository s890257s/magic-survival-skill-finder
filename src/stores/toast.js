import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

const MAX_VISIBLE = 3

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let seed = 0

  /**
   * @param {string} message
   * @param {'success'|'info'|'warning'|'danger'} type
   * @param {{ duration?: number, actionLabel?: string, onAction?: Function }} options
   */
  const showToast = (message, type = 'info', options = {}) => {
    const id = ++seed
    toasts.value.push({
      id,
      message,
      type,
      duration: options.duration ?? 3000,
      actionLabel: options.actionLabel || null,
      onAction: options.onAction || null,
    })
    if (toasts.value.length > MAX_VISIBLE) {
      // 優先淘汰沒有動作按鈕的最舊項，避免「復原」這類 toast 被擠掉
      const evictIndex = toasts.value.findIndex((t) => !t.actionLabel)
      toasts.value.splice(evictIndex === -1 ? 0 : evictIndex, 1)
    }
  }

  // 帶「復原」按鈕的資訊 toast（清空類操作專用）
  const showUndoToast = (message, actionLabel, onUndo) => {
    showToast(message, 'info', { duration: 6000, actionLabel, onAction: onUndo })
  }

  const dismiss = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, showUndoToast, dismiss }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}
