import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const useTrackerStore = defineStore('tracker', () => {
  // 儲存已獲得的基礎技能名稱的陣列 (LocalStorage)
  const acquiredBases = usePersistedRef(STORAGE_KEYS.tracker, [])

  const toggleAcquired = (baseName) => {
    const index = acquiredBases.value.indexOf(baseName)
    if (index === -1) {
      acquiredBases.value.push(baseName)
    } else {
      acquiredBases.value.splice(index, 1)
    }
  }

  const isAcquired = (baseName) => acquiredBases.value.includes(baseName)

  const clearAcquired = () => {
    acquiredBases.value = []
  }

  return {
    acquiredBases,
    toggleAcquired,
    isAcquired,
    clearAcquired,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTrackerStore, import.meta.hot))
}
