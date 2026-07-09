import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, watch } from 'vue'

export const useDictionaryStore = defineStore('dictionary', () => {
  const filters = reactive({
    search: '',
    searchTags: [],
    school: '',
    subject: '',
    baseSkill: '',
    enchant: '',
    ultimate: false,
    excludeConsumed: false
  })

  const ui = reactive({
    isSearchExpanded: true,
    isBuildSummaryExpanded: true,
    isPinnedExpanded: true,
    isOtherExpanded: true
  })

  const storedFilters = localStorage.getItem('dictionary_filters')
  if (storedFilters !== null) {
    try {
      Object.assign(filters, JSON.parse(storedFilters))
    } catch {
      console.error('Failed to parse dictionary_filters from localStorage')
    }
  }

  const storedUi = localStorage.getItem('dictionary_ui')
  if (storedUi !== null) {
    try {
      Object.assign(ui, JSON.parse(storedUi))
    } catch {
      console.error('Failed to parse dictionary_ui from localStorage')
    }
  }

  watch(filters, (val) => {
    localStorage.setItem('dictionary_filters', JSON.stringify(val))
  }, { deep: true })

  watch(ui, (val) => {
    localStorage.setItem('dictionary_ui', JSON.stringify(val))
  }, { deep: true })

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
    clearFilters,
    resetAll
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDictionaryStore, import.meta.hot))
}
