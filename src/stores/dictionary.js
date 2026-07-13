import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, computed } from 'vue'
import { usePersistedReactive } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const useDictionaryStore = defineStore('dictionary', () => {
  // debounce 寫入：search 隨打字高頻變更，不需要每個字元都同步寫 localStorage
  const filters = usePersistedReactive(
    STORAGE_KEYS.dictionaryFilters,
    reactive({
      search: '',
      searchTags: [],
      school: '',
      subject: '',
      baseSkill: '',
      enchant: '',
      ultimate: false,
      excludeConsumed: false,
    }),
    { debounceMs: 300 },
  )

  const ui = usePersistedReactive(
    STORAGE_KEYS.dictionaryUi,
    reactive({
      // 底部 dock：單一抽屜 + 雙 tab，互斥由結構保證
      dockTab: 'search',
      isDockExpanded: false,
      isPinnedExpanded: true,
      isOtherExpanded: true,
    }),
    { debounceMs: 300 },
  )

  const hasAnyFilters = computed(() =>
    Boolean(
      filters.search ||
        filters.searchTags.length > 0 ||
        filters.school ||
        filters.subject ||
        filters.baseSkill ||
        filters.ultimate ||
        filters.excludeConsumed,
    ),
  )

  const clearFilters = () => {
    filters.school = ''
    filters.subject = ''
    filters.baseSkill = ''
    filters.enchant = ''
    filters.ultimate = false
    filters.excludeConsumed = false
  }

  const resetAll = () => {
    clearFilters()
    filters.search = ''
    filters.searchTags = []
  }

  return {
    filters,
    ui,
    hasAnyFilters,
    clearFilters,
    resetAll,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDictionaryStore, import.meta.hot))
}
