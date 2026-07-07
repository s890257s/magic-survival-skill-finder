import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed, ref, watch } from 'vue'
import { skillsById } from '@/data'

const BASE_SLOTS = 3

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
    } catch {
      console.error('Failed to parse favorite_skills from localStorage')
    }
  }

  // Save to local storage whenever it changes
  watch(
    favoriteIds,
    (newVal) => {
      localStorage.setItem('favorite_skills', JSON.stringify(newVal))
    },
    { deep: true },
  )

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

  // --- Saved Builds ---
  const savedBuilds = ref([])
  const storedBuilds = localStorage.getItem('saved_builds')
  if (storedBuilds) {
    try {
      savedBuilds.value = JSON.parse(storedBuilds)
    } catch {
      console.error('Failed to parse saved_builds from localStorage')
    }
  }

  watch(
    savedBuilds,
    (newVal) => {
      localStorage.setItem('saved_builds', JSON.stringify(newVal))
    },
    { deep: true },
  )

  const saveBuild = (name) => {
    if (savedBuilds.value.length >= 10) return false
    savedBuilds.value.push({
      id: Date.now().toString(),
      name,
      date: Date.now(),
      skills: [...favoriteIds.value]
    })
    return true
  }

  const overwriteBuild = (id) => {
    const build = savedBuilds.value.find(b => b.id === id)
    if (build) {
      build.skills = [...favoriteIds.value]
      build.date = Date.now()
    }
  }

  const deleteSavedBuild = (id) => {
    savedBuilds.value = savedBuilds.value.filter(b => b.id !== id)
  }

  const loadSavedBuild = (id) => {
    const build = savedBuilds.value.find(b => b.id === id)
    if (build) {
      setFavorites(build.skills)
    }
  }

  const clearSavedBuilds = () => {
    savedBuilds.value = []
  }

  const renameBuild = (id, newName) => {
    const build = savedBuilds.value.find(b => b.id === id)
    if (build) {
      build.name = newName
    }
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
  }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot))
}
