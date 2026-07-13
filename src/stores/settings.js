import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const useSettingsStore = defineStore('settings', () => {
  const { locale } = useI18n()
  // 舊版存的是 'true'/'false' 原始字串，恰為合法 JSON，與 usePersistedRef 相容
  const _showEnglish = usePersistedRef(STORAGE_KEYS.showEnglish, true)

  const showEnglish = computed(() => {
    // 如果主語系已經是英文，強制不顯示額外的英文標籤
    if (locale.value === 'en') return false
    return _showEnglish.value
  })

  const toggleEnglish = () => {
    if (locale.value === 'en') return // 英文語系下不可切換
    _showEnglish.value = !_showEnglish.value
  }

  return { showEnglish, toggleEnglish }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
