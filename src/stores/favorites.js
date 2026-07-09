import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed } from 'vue'
import { skillsById } from '@/data'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { toggleInArray, swapInArray } from '@/utils/array'

const BASE_SLOTS = 3

const baseSkillsOf = (skill) => {
  return [skill.mainSkill?.name, skill.subSkill?.name].filter(Boolean)
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = usePersistedRef(STORAGE_KEYS.favorites, [])

  const favoriteSkills = computed(() => {
    return favoriteIds.value.map((id) => skillsById.get(id)).filter(Boolean)
  })

  // 遊戲常規 3 格；帶 slotBonus 的技能（如創造之門）可擴充上限
  const maxSlots = computed(() => {
    return favoriteSkills.value.reduce((slots, skill) => slots + (skill.slotBonus || 0), BASE_SLOTS)
  })

  const count = computed(() => favoriteSkills.value.length)
  const isOverLimit = computed(() => count.value > maxSlots.value)

  // 基礎技能使用情況：Map<baseSkillName, [{ id, name }]>
  // conflicts 與 getConflictingWith 共用，避免各自重複掃描 favorites
  const favoriteBaseUsage = computed(() => {
    const usage = new Map()
    favoriteSkills.value.forEach((skill) => {
      baseSkillsOf(skill).forEach((base) => {
        if (!usage.has(base)) usage.set(base, [])
        usage.get(base).push({ id: skill.id, name: skill.name })
      })
    })
    return usage
  })

  // 衝突檢測：Map<skillId, string[]> — 該技能中被重複使用的基礎技能名稱
  const conflicts = computed(() => {
    const result = new Map()
    favoriteBaseUsage.value.forEach((users, base) => {
      if (users.length > 1) {
        users.forEach(({ id }) => {
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
    const hits = []
    baseSkillsOf(skill).forEach((base) => {
      const users = favoriteBaseUsage.value.get(base)
      if (!users) return
      users.forEach((user) => {
        if (user.id !== skill.id) hits.push({ base, skillName: user.name })
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

  return {
    favoriteIds,
    favoriteSkills,
    count,
    maxSlots,
    isOverLimit,
    favoriteBaseUsage,
    conflicts,
    getConflictingWith,
    toggleFavorite,
    isFavorite,
    moveFavorite,
    setFavorites,
    clearFavorites,
  }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFavoritesStore, import.meta.hot))
}
