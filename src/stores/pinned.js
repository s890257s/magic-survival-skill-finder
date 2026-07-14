import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { toggleInArray, reorderVisible } from '@/utils/array'

// 釘選顯示：純排序偏好，與配技（favorites）無關，不做衝突檢測、無數量限制
export const usePinnedStore = defineStore('pinned', () => {
  const pinnedIds = usePersistedRef(STORAGE_KEYS.pinned, [])

  const togglePin = (id) => toggleInArray(pinnedIds.value, id)

  const isPinned = (id) => pinnedIds.value.includes(id)

  const reorderPins = (visibleIds, oldIndex, newIndex) => {
    pinnedIds.value = reorderVisible(pinnedIds.value, visibleIds, oldIndex, newIndex)
  }

  const setPins = (ids) => {
    pinnedIds.value = [...ids]
  }

  const clearPins = () => {
    pinnedIds.value = []
  }

  return { pinnedIds, togglePin, isPinned, reorderPins, setPins, clearPins }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePinnedStore, import.meta.hot))
}
