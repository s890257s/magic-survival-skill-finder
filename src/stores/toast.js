import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/composables/useI18n'

const MAX_VISIBLE = 3

export const useToastStore = defineStore('toast', () => {
  const settingsStore = useSettingsStore()
  const { t } = useI18n()
  const toasts = ref([])
  let seed = 0

  /**
   * @param {string} message
   * @param {'success'|'info'|'warning'|'danger'} type
   * @param {{ duration?: number, actionLabel?: string, onAction?: Function, prefKey?: string }} options
   * prefKey：對應的通知偏好 key，關閉時不顯示；未指定則一律顯示
   */
  const showToast = (message, type = 'info', options = {}) => {
    if (options.prefKey && !settingsStore.notificationPrefs[options.prefKey]) return

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

  // 破壞性操作（清空、刪除、匯入覆蓋）專用：是復原的唯一入口，不受通知偏好管控
  const showUndoToast = (message, onUndo, options = {}) => {
    showToast(message, 'info', {
      duration: 6000,
      actionLabel: t('ui.restore'),
      onAction: onUndo,
      ...options,
    })
  }

  const dismiss = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, showUndoToast, dismiss }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToastStore, import.meta.hot))
}
