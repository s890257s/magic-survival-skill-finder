import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref([])

  // Load from local storage
  const stored = localStorage.getItem('favorite_skills')
  if (stored) {
    try {
      favoriteIds.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse favorite_skills from localStorage')
    }
  }

  // Save to local storage whenever it changes
  watch(favoriteIds, (newVal) => {
    localStorage.setItem('favorite_skills', JSON.stringify(newVal))
  }, { deep: true })

  const toggleFavorite = (id) => {
    const index = favoriteIds.value.indexOf(id)
    if (index === -1) {
      favoriteIds.value.push(id)
    } else {
      favoriteIds.value.splice(index, 1)
    }
  }

  const isFavorite = (id) => favoriteIds.value.includes(id)

  const clearFavorites = () => {
    favoriteIds.value = []
  }

  return { favoriteIds, toggleFavorite, isFavorite, clearFavorites }
})
