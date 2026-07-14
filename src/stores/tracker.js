import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { toggleInArray } from '@/utils/array'

export const useTrackerStore = defineStore('tracker', () => {
  // 儲存已獲得的基礎技能名稱的陣列 (LocalStorage)
  const acquiredBases = usePersistedRef(STORAGE_KEYS.tracker, [])

  const toggleAcquired = (baseName) => toggleInArray(acquiredBases.value, baseName)

  const isAcquired = (baseName) => acquiredBases.value.includes(baseName)

  const removeAcquired = (baseName) => {
    const idx = acquiredBases.value.indexOf(baseName)
    if (idx > -1) {
      acquiredBases.value.splice(idx, 1)
    }
  }

  const clearTracker = () => {
    acquiredBases.value = []
  }

  const setTracker = (bases) => {
    acquiredBases.value = [...bases]
  }

  return {
    acquiredBases,
    toggleAcquired,
    isAcquired,
    removeAcquired,
    clearTracker,
    setTracker,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTrackerStore, import.meta.hot))
}
