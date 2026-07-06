import { defineStore } from 'pinia'
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

  const dismiss = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, dismiss }
})
