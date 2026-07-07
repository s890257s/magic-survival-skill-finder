import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const STORAGE_KEY = 'show_english'

export const useSettingsStore = defineStore('settings', () => {
  const { locale } = useI18n()
  const stored = localStorage.getItem(STORAGE_KEY)
  const _showEnglish = ref(stored !== null ? stored === 'true' : true)

  const showEnglish = computed(() => {
    // 如果主語系已經是英文，強制不顯示額外的英文標籤
    if (locale.value === 'en') return false
    return _showEnglish.value
  })

  const toggleEnglish = () => {
    if (locale.value === 'en') return // 英文語系下不可切換
    _showEnglish.value = !_showEnglish.value
    localStorage.setItem(STORAGE_KEY, _showEnglish.value)
  }

  return { showEnglish, toggleEnglish }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
