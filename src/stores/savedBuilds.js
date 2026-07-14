import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'

const MAX_SAVED_BUILDS = 10

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// 配技存檔庫：與「當前配技」（favorites store）解耦，
// 要存哪些技能由呼叫端傳入，載入時也由呼叫端決定套用到哪。
export const useSavedBuildsStore = defineStore('savedBuilds', () => {
  const savedBuilds = usePersistedRef(STORAGE_KEYS.savedBuilds, [])

  const findBuild = (id) => savedBuilds.value.find((b) => b.id === id)

  const saveBuild = (name, skillIds) => {
    if (savedBuilds.value.length >= MAX_SAVED_BUILDS) return false
    savedBuilds.value.push({
      id: generateId(),
      name,
      date: Date.now(),
      skills: [...skillIds],
    })
    return true
  }

  // 更新存檔：name / skillIds 皆為可選，只更新有給的欄位；改內容時同步更新時間
  const updateBuild = (id, { name, skillIds } = {}) => {
    const build = findBuild(id)
    if (!build) return
    if (name !== undefined) build.name = name
    if (skillIds !== undefined) {
      build.skills = [...skillIds]
      build.date = Date.now()
    }
  }

  const deleteSavedBuild = (id) => {
    savedBuilds.value = savedBuilds.value.filter((b) => b.id !== id)
  }

  // 還原刪除的存檔到原位置；index 無效時附加到尾端
  const restoreBuild = (build, index) => {
    if (typeof index === 'number' && index >= 0 && index <= savedBuilds.value.length) {
      savedBuilds.value.splice(index, 0, build)
    } else {
      savedBuilds.value.push(build)
    }
  }

  const clearSavedBuilds = () => {
    savedBuilds.value = []
  }

  const setSavedBuilds = (builds) => {
    savedBuilds.value = [...builds]
  }

  return {
    savedBuilds,
    findBuild,
    saveBuild,
    updateBuild,
    deleteSavedBuild,
    restoreBuild,
    clearSavedBuilds,
    setSavedBuilds,
    maxSavedBuilds: MAX_SAVED_BUILDS,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSavedBuildsStore, import.meta.hot))
}
