import { ref, watch } from 'vue'

// 持久化狀態：以 localStorage 初始化，變更時自動寫回（JSON 序列化）。
// 僅適用於 JSON 相容的儲存格式；theme / locale 等存原始字串、
// 帶跟隨系統等特殊邏輯的項目維持各自實作。

const readStored = (key) => {
  const stored = localStorage.getItem(key)
  if (stored === null) return undefined
  try {
    return JSON.parse(stored)
  } catch {
    console.error(`Failed to parse ${key} from localStorage`)
    return undefined
  }
}

// debounceMs > 0 時延遲寫入，避免高頻變更（如搜尋輸入）每次都同步寫 localStorage
const createWriter = (key, debounceMs) => {
  let timer = null
  return (val) => {
    const write = () => localStorage.setItem(key, JSON.stringify(val))
    if (debounceMs <= 0) {
      write()
      return
    }
    clearTimeout(timer)
    timer = setTimeout(write, debounceMs)
  }
}

export function usePersistedRef(key, defaultValue, { debounceMs = 0 } = {}) {
  const value = ref(defaultValue)

  const stored = readStored(key)
  if (stored !== undefined) value.value = stored

  watch(value, createWriter(key, debounceMs), { deep: true })

  return value
}

// reactive 物件版：以 Object.assign 合併已存值（保留新增欄位的預設值）
export function usePersistedReactive(key, target, { debounceMs = 0 } = {}) {
  const stored = readStored(key)
  if (stored !== undefined && typeof stored === 'object' && stored !== null) {
    Object.assign(target, stored)
  }

  watch(target, createWriter(key, debounceMs), { deep: true })

  return target
}
