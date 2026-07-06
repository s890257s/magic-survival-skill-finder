import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'show_english'

export const useSettingsStore = defineStore('settings', () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const showEnglish = ref(stored !== null ? stored === 'true' : true)

  const toggleEnglish = () => {
    showEnglish.value = !showEnglish.value
    localStorage.setItem(STORAGE_KEY, showEnglish.value)
  }

  return { showEnglish, toggleEnglish }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
