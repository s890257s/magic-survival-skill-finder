import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

export const useThemeStore = defineStore('theme', () => {
  const media = window.matchMedia('(prefers-color-scheme: light)')
  const stored = localStorage.getItem(STORAGE_KEY)

  // 預設跟隨系統，使用者手動切換後才寫入 LocalStorage 固定
  const theme = ref(stored || (media.matches ? 'light' : 'dark'))

  const apply = (val) => {
    document.documentElement.setAttribute('data-theme', val)
  }
  apply(theme.value)

  watch(theme, apply)

  media.addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      theme.value = e.matches ? 'light' : 'dark'
    }
  })

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, theme.value)
  }

  return { theme, toggleTheme }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThemeStore, import.meta.hot))
}
