import { defineStore, acceptHMRUpdate } from 'pinia'
import { reactive, watch } from 'vue'

export const useDictionaryStore = defineStore('dictionary', () => {
  const filters = reactive({
    search: '',
    school: '',
    subject: '',
    baseSkill: '',
    enchant: '',
    ultimate: false,
    excludeConsumed: false
  })

  const stored = localStorage.getItem('dictionary_filters')
  if (stored !== null) {
    try {
      Object.assign(filters, JSON.parse(stored))
    } catch {
      console.error('Failed to parse dictionary_filters from localStorage')
    }
  }

  watch(filters, (val) => {
    localStorage.setItem('dictionary_filters', JSON.stringify(val))
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
  }

  return {
    filters,
    clearFilters,
    resetAll
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDictionaryStore, import.meta.hot))
}
