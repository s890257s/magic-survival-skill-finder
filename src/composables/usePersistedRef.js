import { ref, watch } from 'vue'

// 持久化 ref：以 localStorage 初始化，變更時自動寫回（JSON 序列化）。
// 注意：僅適用於 JSON 相容的儲存格式；theme / locale 等存原始字串的項目
// 各有跟隨系統、computed 包裝等特殊邏輯，維持各自實作。
export function usePersistedRef(key, defaultValue) {
  const value = ref(defaultValue)

  const stored = localStorage.getItem(key)
  if (stored !== null) {
    try {
      value.value = JSON.parse(stored)
    } catch {
      console.error(`Failed to parse ${key} from localStorage`)
    }
  }

  watch(value, (val) => localStorage.setItem(key, JSON.stringify(val)), { deep: true })

  return value
}
