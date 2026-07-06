import { defineStore } from 'pinia'
import { ref } from 'vue'

const MAX_VISIBLE = 3

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let seed = 0

  /**
   * @param {string} message
   * @param {'success'|'warning'|'info'} type
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
      toasts.value.shift()
    }
  }

  const dismiss = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, showToast, dismiss }
})
