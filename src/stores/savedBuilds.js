import { defineStore, acceptHMRUpdate } from 'pinia'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'

const MAX_SAVED_BUILDS = 10

// 配技存檔庫：與「當前配技」（favorites store）解耦，
// 要存哪些技能由呼叫端傳入，載入時也由呼叫端決定套用到哪。
export const useSavedBuildsStore = defineStore('savedBuilds', () => {
  const savedBuilds = usePersistedRef(STORAGE_KEYS.savedBuilds, [])

  const findBuild = (id) => savedBuilds.value.find((b) => b.id === id)

  const saveBuild = (name, skillIds) => {
    if (savedBuilds.value.length >= MAX_SAVED_BUILDS) return false
    savedBuilds.value.push({
      id: crypto.randomUUID(),
      name,
      date: Date.now(),
      skills: [...skillIds],
    })
    return true
  }

  const overwriteBuild = (id, skillIds) => {
    const build = findBuild(id)
    if (build) {
      build.skills = [...skillIds]
      build.date = Date.now()
    }
  }

  const deleteSavedBuild = (id) => {
    savedBuilds.value = savedBuilds.value.filter((b) => b.id !== id)
  }

  const renameBuild = (id, newName) => {
    const build = findBuild(id)
    if (build) {
      build.name = newName
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
    overwriteBuild,
    deleteSavedBuild,
    renameBuild,
    clearSavedBuilds,
    setSavedBuilds,
    maxSavedBuilds: MAX_SAVED_BUILDS,
  }
})

// 開發時熱更新 store 定義，避免舊實例缺少新方法（對 production build 無影響）
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSavedBuildsStore, import.meta.hot))
}
