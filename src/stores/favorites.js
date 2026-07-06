import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { skillsById } from '../data'


const baseSkillsOf = (skill) => {
  return [skill.mainSkill?.name, skill.subSkill?.name].filter(Boolean)
}

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

  const favoriteSkills = computed(() => {
    return favoriteIds.value
      .map(id => skillsById.get(id))
      .filter(Boolean)
  })

  const maxSlots = computed(() => {
    const hasCreationGate = favoriteSkills.value.some(skill => skill.name === '創造之門' || skill.name === '创造之门')
    return hasCreationGate ? 5 : 3
  })

  const count = computed(() => favoriteSkills.value.length)
  const isOverLimit = computed(() => count.value > maxSlots.value)

  // 衝突檢測：Map<skillId, string[]> — 該技能中被重複使用的基礎技能名稱
  const conflicts = computed(() => {
    const result = new Map()
    const baseSkillUsage = {} // baseSkillName -> skillIds

    favoriteSkills.value.forEach(skill => {
      baseSkillsOf(skill).forEach(base => {
        if (!baseSkillUsage[base]) baseSkillUsage[base] = []
        baseSkillUsage[base].push(skill.id)
      })
    })

    Object.entries(baseSkillUsage).forEach(([base, ids]) => {
      if (ids.length > 1) {
        ids.forEach(id => {
          if (!result.has(id)) result.set(id, [])
          result.get(id).push(base)
        })
      }
    })

    return result
  })

  // 檢查某技能與目前配裝的衝突（加入前預先偵測用）
  // 回傳 [{ base, skillName }]
  const getConflictingWith = (skill) => {
    const bases = baseSkillsOf(skill)
    const hits = []
    favoriteSkills.value.forEach(fav => {
      if (fav.id === skill.id) return
      baseSkillsOf(fav).forEach(base => {
        if (bases.includes(base)) {
          hits.push({ base, skillName: fav.name })
        }
      })
    })
    return hits
  }

  const toggleFavorite = (id) => {
    const index = favoriteIds.value.indexOf(id)
    if (index === -1) {
      favoriteIds.value.push(id)
    } else {
      favoriteIds.value.splice(index, 1)
    }
  }

  const isFavorite = (id) => favoriteIds.value.includes(id)

  // 調整順序：delta 為 -1（上移）或 1（下移）
  const moveFavorite = (id, delta) => {
    const index = favoriteIds.value.indexOf(id)
    const target = index + delta
    if (index === -1 || target < 0 || target >= favoriteIds.value.length) return
    const list = favoriteIds.value
    ;[list[index], list[target]] = [list[target], list[index]]
  }

  const setFavorites = (ids) => {
    favoriteIds.value = [...ids]
  }

  const clearFavorites = () => {
    favoriteIds.value = []
  }

  return {
    favoriteIds,
    favoriteSkills,
    count,
    maxSlots,
    isOverLimit,
    conflicts,
    getConflictingWith,
    toggleFavorite,
    isFavorite,
    moveFavorite,
    setFavorites,
    clearFavorites,
  }
})
