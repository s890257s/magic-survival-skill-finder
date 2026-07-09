import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { toggleInArray, swapInArray } from '@/utils/array'

// 頂置顯示：純排序偏好，與配技（favorites）無關，不做衝突檢測、無數量限制
export const usePinnedStore = defineStore('pinned', () => {
  const pinnedIds = usePersistedRef(STORAGE_KEYS.pinned, [])

  const togglePin = (id) => toggleInArray(pinnedIds.value, id)

  const isPinned = (id) => pinnedIds.value.includes(id)

  // 交換兩個頂置技能的順序（呼叫端決定交換對象，篩選中以「可見鄰居」為準）
  const swapPins = (idA, idB) => swapInArray(pinnedIds.value, idA, idB)

  const setPins = (ids) => {
    pinnedIds.value = [...ids]
  }

  const clearPins = () => {
    pinnedIds.value = []
  }

  return { pinnedIds, togglePin, isPinned, swapPins, setPins, clearPins }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePinnedStore, import.meta.hot))
}
