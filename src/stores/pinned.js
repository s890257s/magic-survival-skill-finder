import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { toggleInArray } from '@/utils/array'

// 釘選顯示：純排序偏好，與配技（favorites）無關，不做衝突檢測、無數量限制
export const usePinnedStore = defineStore('pinned', () => {
  const pinnedIds = usePersistedRef(STORAGE_KEYS.pinned, [])

  const togglePin = (id) => toggleInArray(pinnedIds.value, id)

  const isPinned = (id) => pinnedIds.value.includes(id)

  // 拖曳排序：visibleIds 為畫面上可見的釘選 id（依目前順序），
  // 以可見清單算出新順序後回寫，不在畫面上的 id（如已失效者）保留原位置
  const reorderVisible = (visibleIds, oldIndex, newIndex) => {
    const newOrder = [...visibleIds]
    const moved = newOrder.splice(oldIndex, 1)[0]
    newOrder.splice(newIndex, 0, moved)

    const visibleSet = new Set(visibleIds)
    let ptr = 0
    pinnedIds.value = pinnedIds.value.map((id) => (visibleSet.has(id) ? newOrder[ptr++] : id))
  }

  const setPins = (ids) => {
    pinnedIds.value = [...ids]
  }

  const clearPins = () => {
    pinnedIds.value = []
  }

  return { pinnedIds, togglePin, isPinned, reorderVisible, setPins, clearPins }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePinnedStore, import.meta.hot))
}
