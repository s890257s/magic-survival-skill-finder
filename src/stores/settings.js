import { defineStore } from 'pinia'
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
