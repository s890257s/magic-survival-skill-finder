import { defineStore, acceptHMRUpdate } from 'pinia'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { usePersistedRef } from '@/composables/usePersistedRef'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const useSettingsStore = defineStore('settings', () => {
  const { locale } = useI18n()
  // 舊版存的是 'true'/'false' 原始字串，恰為合法 JSON，與 usePersistedRef 相容
  const _showEnglish = usePersistedRef(STORAGE_KEYS.showEnglish, true)

  // mergeDefaults：舊使用者的存檔缺新增的偏好 key 時自動補預設值
  const notificationPrefs = usePersistedRef(
    STORAGE_KEYS.notifications,
    {
      general: true,
      pin: true,
      favoriteSuccess: true,
      favoriteWarning: true,
    },
    { mergeDefaults: true },
  )

  const showEnglish = computed(() => {
    // 如果主語系已經是英文，強制不顯示額外的英文標籤
    if (locale.value === 'en') return false
    return _showEnglish.value
  })

  const toggleEnglish = () => {
    if (locale.value === 'en') return // 英文語系下不可切換
    _showEnglish.value = !_showEnglish.value
  }

  const toggleNotification = (key) => {
    if (key in notificationPrefs.value) {
      notificationPrefs.value[key] = !notificationPrefs.value[key]
    }
  }

  const setAllNotifications = (val) => {
    Object.keys(notificationPrefs.value).forEach((key) => {
      notificationPrefs.value[key] = val
    })
  }

  return { 
    showEnglish, 
    toggleEnglish,
    notificationPrefs,
    toggleNotification,
    setAllNotifications
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
