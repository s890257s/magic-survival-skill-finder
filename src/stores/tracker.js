import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { toggleInArray } from '@/utils/array'

export const useTrackerStore = defineStore('tracker', () => {
  // 儲存已獲得的基礎技能名稱的陣列 (LocalStorage)
  const acquiredBases = usePersistedRef(STORAGE_KEYS.tracker, [])

  const toggleAcquired = (baseName) => toggleInArray(acquiredBases.value, baseName)

  const isAcquired = (baseName) => acquiredBases.value.includes(baseName)

  return {
    acquiredBases,
    toggleAcquired,
    isAcquired,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTrackerStore, import.meta.hot))
}
