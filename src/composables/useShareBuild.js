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

  // 匯入目標的差異集中於此，流程共用
  const importTargets = {
    current: {
      isEmpty: () => favoritesStore.favoriteIds.length === 0,
      backup: () => [...favoritesStore.favoriteIds],
      apply: (data) => favoritesStore.setFavorites(data),
      confirmKey: 'ui.builder.importConfirmMsg',
    },
    saves: {
      isEmpty: () => savedBuildsStore.savedBuilds.length === 0,
      backup: () => [...savedBuildsStore.savedBuilds],
      apply: (data) => savedBuildsStore.setSavedBuilds(data),
      confirmKey: 'ui.builder.importSavesConfirmMsg',
    },
  }

  const importConfirmMessage = computed(() =>
    t(importTargets[importData.value?.type]?.confirmKey || 'ui.builder.importConfirmMsg'),
  )

  const copyWithFeedback = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // 非安全來源（如區網 HTTP 測試）沒有 clipboard API，退回 execCommand
        const textArea = document.createElement('textarea')
        textArea.value = text
        // 固定在畫面外，避免部分瀏覽器聚焦時捲動到頁尾
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'

        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (!successful) throw new Error('Fallback copy failed')
      }
      toastStore.showToast(t('ui.builder.exportSuccess'), 'success', { prefKey: 'general' })
    } catch (e) {
      console.error('Clipboard write failed', e)
      toastStore.showToast(t('ui.builder.exportFail'), 'warning', { prefKey: 'general' })
    }
  }

  const openExportModal = () => {
    if (favoritesStore.favoriteSkills.length === 0 && savedBuildsStore.savedBuilds.length === 0) {
      toastStore.showToast(t('ui.builder.exportEmpty'), 'warning', { prefKey: 'general' })
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
        toastStore.showToast(t('ui.builder.exportEmpty'), 'warning', { prefKey: 'general' })
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
      toastStore.showToast(t('ui.builder.exportTooLongMsg'), 'warning', {
        duration: 6000,
        prefKey: 'general',
      })
    }

    await copyWithFeedback(shareUrl.value)
    showShareModal.value = true
  }

  const processImportData = (obj) => {
    if (!obj || !importTargets[obj.type] || !obj.data) return
    importData.value = obj

    // 目標為空直接套用；有資料才需要覆蓋確認
    if (importTargets[obj.type].isEmpty()) {
      executeImport()
    } else {
      showImportConfirm.value = true
    }
  }

  const executeImport = () => {
    const target = importTargets[importData.value?.type]
    if (!target) return

    const backup = target.backup()
    target.apply(importData.value.data)
    toastStore.showUndoToast(t('ui.builder.importSuccess'), () => target.apply(backup))

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
