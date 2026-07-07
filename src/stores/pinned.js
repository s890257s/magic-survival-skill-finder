import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'pinned_skills'

// 頂置顯示：純排序偏好，與配技（favorites）無關，不做衝突檢測、無數量限制
export const usePinnedStore = defineStore('pinned', () => {
  const pinnedIds = ref([])

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      pinnedIds.value = JSON.parse(stored)
    } catch {
      console.error('Failed to parse pinned_skills from localStorage')
    }
  }

  watch(pinnedIds, (val) => localStorage.setItem(STORAGE_KEY, JSON.stringify(val)), { deep: true })

  const togglePin = (id) => {
    const index = pinnedIds.value.indexOf(id)
    if (index === -1) {
      pinnedIds.value.push(id)
    } else {
      pinnedIds.value.splice(index, 1)
    }
  }

  const isPinned = (id) => pinnedIds.value.includes(id)

  // 交換兩個頂置技能的順序（呼叫端決定交換對象，篩選中以「可見鄰居」為準）
  const swapPins = (idA, idB) => {
    const a = pinnedIds.value.indexOf(idA)
    const b = pinnedIds.value.indexOf(idB)
    if (a === -1 || b === -1) return
    const list = pinnedIds.value
    ;[list[a], list[b]] = [list[b], list[a]]
  }

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
