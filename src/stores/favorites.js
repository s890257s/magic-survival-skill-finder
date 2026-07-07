import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed } from 'vue'
import { skillsById } from '@/data'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { toggleInArray, swapInArray } from '@/utils/array'

const BASE_SLOTS = 3
const MAX_SAVED_BUILDS = 10

const baseSkillsOf = (skill) => {
  return [skill.mainSkill?.name, skill.subSkill?.name].filter(Boolean)
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = usePersistedRef('favorite_skills', [])

  const favoriteSkills = computed(() => {
    return favoriteIds.value.map((id) => skillsById.get(id)).filter(Boolean)
  })

  // 遊戲常規 3 格；帶 slotBonus 的技能（如創造之門）可擴充上限
  const maxSlots = computed(() => {
    return favoriteSkills.value.reduce((slots, skill) => slots + (skill.slotBonus || 0), BASE_SLOTS)
  })

  const count = computed(() => favoriteSkills.value.length)
  const isOverLimit = computed(() => count.value > maxSlots.value)

  // 衝突檢測：Map<skillId, string[]> — 該技能中被重複使用的基礎技能名稱
  const conflicts = computed(() => {
    const result = new Map()
    const baseSkillUsage = {} // baseSkillName -> skillIds

    favoriteSkills.value.forEach((skill) => {
      baseSkillsOf(skill).forEach((base) => {
        if (!baseSkillUsage[base]) baseSkillUsage[base] = []
        baseSkillUsage[base].push(skill.id)
      })
    })

    Object.entries(baseSkillUsage).forEach(([base, ids]) => {
      if (ids.length > 1) {
        ids.forEach((id) => {
          if (!result.has(id)) result.set(id, [])
          result.get(id).push(base)
        })
      }
    })

    return result
  })

  // 檢查某技能與目前配技的衝突（加入前預先偵測用）
  // 回傳 [{ base, skillName }]
  const getConflictingWith = (skill) => {
    const bases = baseSkillsOf(skill)
    const hits = []
    favoriteSkills.value.forEach((fav) => {
      if (fav.id === skill.id) return
      baseSkillsOf(fav).forEach((base) => {
        if (bases.includes(base)) {
          hits.push({ base, skillName: fav.name })
        }
      })
    })
    return hits
  }

  const toggleFavorite = (id) => toggleInArray(favoriteIds.value, id)

  const isFavorite = (id) => favoriteIds.value.includes(id)

  // 調整順序：delta 為 -1（上移）或 1（下移）
  const moveFavorite = (id, delta) => {
    const index = favoriteIds.value.indexOf(id)
    if (index === -1) return
    const target = favoriteIds.value[index + delta]
    if (target === undefined) return
    swapInArray(favoriteIds.value, id, target)
  }

  const setFavorites = (ids) => {
    favoriteIds.value = [...ids]
  }

  const clearFavorites = () => {
    favoriteIds.value = []
  }

  // --- Saved Builds ---
  const savedBuilds = usePersistedRef('saved_builds', [])

  const findBuild = (id) => savedBuilds.value.find((b) => b.id === id)

  const saveBuild = (name) => {
    if (savedBuilds.value.length >= MAX_SAVED_BUILDS) return false
    savedBuilds.value.push({
      id: Date.now().toString(),
      name,
      date: Date.now(),
      skills: [...favoriteIds.value]
    })
    return true
  }

  const overwriteBuild = (id) => {
    const build = findBuild(id)
    if (build) {
      build.skills = [...favoriteIds.value]
      build.date = Date.now()
    }
  }

  const deleteSavedBuild = (id) => {
    savedBuilds.value = savedBuilds.value.filter(b => b.id !== id)
  }

  const loadSavedBuild = (id) => {
    const build = findBuild(id)
    if (build) {
      setFavorites(build.skills)
    }
  }

  const clearSavedBuilds = () => {
    savedBuilds.value = []
  }

  const renameBuild = (id, newName) => {
    const build = findBuild(id)
    if (build) {
      build.name = newName
    }
  }

  const setSavedBuilds = (builds) => {
    savedBuilds.value = [...builds]
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
    savedBuilds,
    saveBuild,
    overwriteBuild,
    deleteSavedBuild,
    loadSavedBuild,
    clearSavedBuilds,
    renameBuild,
    setSavedBuilds,
    maxSavedBuilds: MAX_SAVED_BUILDS,
  }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot))
}
