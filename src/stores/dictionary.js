import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, computed } from 'vue'
import { skillsData } from '@/data'
import { usePersistedReactive } from '@/composables/usePersistedRef'
import { useFavoritesStore } from '@/stores/favorites'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const useDictionaryStore = defineStore('dictionary', () => {
  const favoritesStore = useFavoritesStore()
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

  // 篩選結果：搜尋詞（輸入中 + 已成 tag）與各下拉條件全數符合才保留
  const filteredSkills = computed(() => {
    const searchTerms = [...filters.searchTags, filters.search.trim()]
      .filter(Boolean)
      .map((term) => term.toLowerCase())

    return skillsData.filter((skill) => {
      if (searchTerms.some((q) => !skill.searchText.includes(q))) return false

      // 學派篩選：等待遊戲學派資料補齊，暫時停用
      if (
        filters.school &&
        skill.requirements?.school &&
        skill.requirements.school !== filters.school
      ) {
        return false
      }
      if (filters.subject && skill.requirements?.subject !== filters.subject) {
        return false
      }
      if (filters.baseSkill) {
        const matchMain = skill.mainSkill?.name === filters.baseSkill
        const matchSub = skill.subSkill?.name === filters.baseSkill
        if (!matchMain && !matchSub) return false

        if (filters.enchant) {
          let enchantMatched = false
          if (matchMain && skill.mainSkill?.enchant === filters.enchant) enchantMatched = true
          if (matchSub && skill.subSkill?.enchant === filters.enchant) enchantMatched = true
          if (!enchantMatched) return false
        }
      }
      if (filters.ultimate && !skill.requirements?.ultimate) {
        return false
      }
      if (filters.excludeConsumed) {
        const main = skill.mainSkill?.name
        const sub = skill.subSkill?.name
        // 已加入配技的技能其基礎技也算「被消耗」，因此技能本身也會被過濾掉
        //（刻意設計：已選過的組合不需要再出現在候選清單）
        const usedBases = favoritesStore.favoriteBaseUsage
        if ((main && usedBases.has(main)) || (sub && usedBases.has(sub))) {
          return false
        }
      }
      return true
    })
  })

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
    filteredSkills,
    hasAnyFilters,
    clearFilters,
    resetAll,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDictionaryStore, import.meta.hot))
}
