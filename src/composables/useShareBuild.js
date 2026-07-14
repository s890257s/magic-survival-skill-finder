import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { useSavedBuildsStore } from '@/stores/savedBuilds'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { exportDataToToken, parseTokenToData } from '@/utils/share'
import { useDictionaryStore } from '@/stores/dictionary'

// 常見平台（LINE、舊版瀏覽器等）的 URL 安全長度上限
const MAX_SHARE_URL_LENGTH = 2000

// 分享匯出 / 匯入完整流程：token 編解碼、URL query 監聽、覆蓋前確認與復原
export function useShareBuild() {
  const favoritesStore = useFavoritesStore()
  const savedBuildsStore = useSavedBuildsStore()
  const toastStore = useToastStore()
  const dictionaryStore = useDictionaryStore()
  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()

  const showShareModal = ref(false)
  const shareUrl = ref('')
  const showExportChoiceModal = ref(false)
  const showImportConfirm = ref(false)
  const importData = ref(null)

  const importConfirmMessage = computed(() =>
    importData.value?.type === 'saves'
      ? t('ui.builder.importSavesConfirmMsg')
      : t('ui.builder.importConfirmMsg'),
  )

  const copyWithFeedback = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toastStore.showToast(t('ui.builder.exportSuccess'), 'success')
    } catch {
      toastStore.showToast(t('ui.builder.exportFail'), 'warning')
    }
  }

  const openExportModal = () => {
    if (favoritesStore.favoriteSkills.length === 0 && savedBuildsStore.savedBuilds.length === 0) {
      toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
      return
    }
    if (savedBuildsStore.savedBuilds.length === 0) {
      doExport('current')
    } else {
      showExportChoiceModal.value = true
    }
  }

  const doExport = async (type) => {
    showExportChoiceModal.value = false
    let dataObj
    if (type === 'current') {
      if (favoritesStore.favoriteSkills.length === 0) {
        toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
        return
      }
      dataObj = { type: 'current', data: favoritesStore.favoriteSkills.map((s) => s.id) }
    } else if (type === 'saves') {
      dataObj = { type: 'saves', data: savedBuildsStore.savedBuilds }
    }

    const token = exportDataToToken(dataObj)
    const base = window.location.origin + window.location.pathname
    shareUrl.value = `${base}#/?share=${token}`

    if (shareUrl.value.length > MAX_SHARE_URL_LENGTH) {
      toastStore.showToast(t('ui.builder.exportTooLongMsg'), 'warning', { duration: 6000 })
    }

    await copyWithFeedback(shareUrl.value)
    showShareModal.value = true
  }

  const processImportData = (obj) => {
    if (!obj || !obj.type || !obj.data) return
    importData.value = obj

    const isEmpty =
      obj.type === 'saves'
        ? savedBuildsStore.savedBuilds.length === 0
        : favoritesStore.favoriteIds.length === 0
    if (isEmpty) {
      executeImport()
    } else {
      showImportConfirm.value = true
    }
  }

  const executeImport = () => {
    if (!importData.value) return

    if (importData.value.type === 'current') {
      const backup = [...favoritesStore.favoriteIds]
      favoritesStore.setFavorites(importData.value.data)
      toastStore.showToast(t('ui.builder.importSuccess'), 'success', {
        duration: 6000,
        actionLabel: t('ui.restore'),
        onAction: () => favoritesStore.setFavorites(backup),
      })
    } else if (importData.value.type === 'saves') {
      const backup = [...savedBuildsStore.savedBuilds]
      savedBuildsStore.setSavedBuilds(importData.value.data)
      toastStore.showToast(t('ui.builder.importSuccess'), 'success', {
        duration: 6000,
        actionLabel: t('ui.restore'),
        onAction: () => savedBuildsStore.setSavedBuilds(backup),
      })
    }
    
    dictionaryStore.ui.dockTab = 'build'
    dictionaryStore.ui.isDockExpanded = true
    
    router.replace({ query: {} })
    importData.value = null
  }

  const cancelImport = () => {
    router.replace({ query: {} })
    importData.value = null
  }

  watch(
    () => route.query.share,
    (newShare) => {
      if (!newShare) return
      const obj = parseTokenToData(newShare)
      if (obj) {
        processImportData(obj)
      } else {
        router.replace({ query: {} })
      }
    },
    { immediate: true },
  )

  return {
    showShareModal,
    shareUrl,
    showExportChoiceModal,
    showImportConfirm,
    importConfirmMessage,
    copyWithFeedback,
    openExportModal,
    doExport,
    executeImport,
    cancelImport,
  }
}
