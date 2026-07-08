<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import SkillCard from '@/components/SkillCard.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SavedBuildsPanel from '@/components/builder/SavedBuildsPanel.vue'
import SaveBuildModal from '@/components/builder/SaveBuildModal.vue'
import BuildSummary from '@/components/builder/BuildSummary.vue'
import { Share2, Trash2, AlertTriangle, BookOpen, Layers, Save } from '@lucide/vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { exportDataToToken, parseTokenToData } from '@/utils/share'

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)
const conflicts = computed(() => favoritesStore.conflicts)
const savedBuilds = computed(() => favoritesStore.savedBuilds)

const showShareModal = ref(false)
const shareUrl = ref('')
const showImportConfirm = ref(false)
const importData = ref(null)
const showExportChoiceModal = ref(false)
const showSaveModal = ref(false)

// 匯入確認訊息依匯入類型（目前配技 / 儲存庫）切換
const importConfirmMessage = computed(() =>
  importData.value?.type === 'saves'
    ? t('ui.builder.importSavesConfirmMsg')
    : t('ui.builder.importConfirmMsg'),
)

const handleSaveClick = () => {
  if (favoriteSkills.value.length === 0) return
  showSaveModal.value = true
}

const openExportModal = () => {
  if (favoriteSkills.value.length === 0 && savedBuilds.value.length === 0) {
    toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
    return
  }
  if (savedBuilds.value.length === 0) {
    doExport('current')
  } else {
    showExportChoiceModal.value = true
  }
}

// 複製到剪貼簿並以 toast 回報結果
const copyWithFeedback = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toastStore.showToast(t('ui.builder.exportSuccess'), 'success')
  } catch {
    toastStore.showToast(t('ui.builder.exportFail'), 'warning')
  }
}

const doExport = async (type) => {
  showExportChoiceModal.value = false
  let dataObj
  if (type === 'current') {
    if (favoriteSkills.value.length === 0) {
      toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
      return
    }
    dataObj = { type: 'current', data: favoriteSkills.value.map(s => s.id) }
  } else if (type === 'saves') {
    dataObj = { type: 'saves', data: savedBuilds.value }
  }

  const token = exportDataToToken(dataObj)
  const base = window.location.origin + window.location.pathname
  shareUrl.value = `${base}#/builder?share=${token}`

  await copyWithFeedback(shareUrl.value)
  showShareModal.value = true
}

const processImportData = (obj) => {
  if (!obj || !obj.type || !obj.data) return
  importData.value = obj

  // 本地無同類型資料時直接匯入，否則先確認是否覆蓋
  const isEmpty =
    obj.type === 'saves'
      ? favoritesStore.savedBuilds.length === 0
      : favoritesStore.favoriteIds.length === 0
  if (isEmpty) {
    executeImport()
  } else {
    showImportConfirm.value = true
  }
}

const executeImport = () => {
  if (!importData.value) return
  const backupCurrent = [...favoritesStore.favoriteIds]
  const backupSaves = [...favoritesStore.savedBuilds]
  
  if (importData.value.type === 'current') {
    favoritesStore.setFavorites(importData.value.data)
    toastStore.showToast(t('ui.builder.importSuccess'), 'success', {
      duration: 6000,
      actionLabel: t('ui.restore'),
      onAction: () => favoritesStore.setFavorites(backupCurrent)
    })
  } else if (importData.value.type === 'saves') {
    favoritesStore.setSavedBuilds(importData.value.data)
    toastStore.showToast(t('ui.builder.importSuccess'), 'success', {
      duration: 6000,
      actionLabel: t('ui.restore'),
      onAction: () => favoritesStore.setSavedBuilds(backupSaves)
    })
  }
  router.replace({ query: {} })
  importData.value = null
}

const cancelImportAny = () => {
  router.replace({ query: {} })
  importData.value = null
}

watch(() => route.query.share, (newShare) => {
  if (newShare) {
    const obj = parseTokenToData(newShare)
    if (obj) {
      processImportData(obj)
    } else {
      router.replace({ query: {} })
    }
  }
}, { immediate: true })

const clearAll = () => {
  const backup = [...favoritesStore.favoriteIds]
  favoritesStore.clearFavorites()
  toastStore.showUndoToast(t('ui.builder.clearedMsg'), t('ui.restore'), () =>
    favoritesStore.setFavorites(backup),
  )
}

const skillGridRef = ref(null)
let gridSortable = null

const initSortable = () => {
  if (skillGridRef.value && !gridSortable) {
    gridSortable = Sortable.create(skillGridRef.value, {
      delay: 200,
      delayOnTouchOnly: true,
      filter: 'button, .pin-btn, .favorite-btn, .formula-value, .magic-tag, .expand-icon',
      preventOnFilter: false,
      animation: 150,
      onEnd: handleSortEnd
    })
  }
}

const handleSortEnd = (evt) => {
  const { oldIndex, newIndex } = evt
  if (oldIndex === newIndex) return

  const newIds = [...favoritesStore.favoriteIds]
  const movedId = newIds.splice(oldIndex, 1)[0]
  newIds.splice(newIndex, 0, movedId)

  // 避免 Sortable 修改的 DOM 導致 Vue 的 virtual DOM 失步
  const itemEl = evt.item
  if (evt.from) {
    const siblings = Array.from(evt.from.childNodes).filter(node => node.nodeType === 1)
    if (oldIndex < siblings.length) {
      evt.from.insertBefore(itemEl, siblings[oldIndex])
    } else {
      evt.from.appendChild(itemEl)
    }
  }

  favoritesStore.setFavorites(newIds)
}

watch(() => favoriteSkills.value.length, async () => {
  await nextTick()
  initSortable()
})

onMounted(() => {
  initSortable()
})

onBeforeUnmount(() => {
  if (gridSortable) gridSortable.destroy()
})
</script>

<template>
  <div class="builder-view">
    <header class="builder-header">
      <div class="header-content">
        <div class="title-area">
          <h2>{{ t('ui.builder.title') }}</h2>
          <span
            v-if="favoritesStore.count > 0"
            class="slot-count"
            :class="{ over: favoritesStore.isOverLimit }"
          >
            {{ favoritesStore.count }}/{{ favoritesStore.maxSlots }}
          </span>
        </div>
        <div class="header-actions">
          <button @click="clearAll" class="btn btn-text action-btn" v-if="favoriteSkills.length > 0">
            <Trash2 :size="18" /> <span class="btn-text-content">{{ t('ui.builder.clear') }}</span>
          </button>
          <button @click="handleSaveClick" class="btn btn-primary action-btn" v-if="favoriteSkills.length > 0">
            <Save :size="18" /> <span class="btn-text-content">{{ t('ui.builder.save') }}</span>
          </button>
          <button @click="openExportModal" class="btn btn-primary action-btn">
            <Share2 :size="18" /> <span class="btn-text-content">{{ t('ui.builder.export') }}</span>
          </button>
          <HeaderActions />
        </div>
      </div>
      <div v-if="favoritesStore.isOverLimit" class="banner limit-banner">
        <Layers :size="20" />
        <span>{{ t('ui.builder.limitWarning', favoritesStore.maxSlots) }}</span>
      </div>
      <div v-if="conflicts.size > 0" class="banner conflict-banner">
        <AlertTriangle :size="20" />
        <span>{{ t('ui.builder.conflictWarning') }}</span>
      </div>
    </header>

    <div class="build-content">
      <SavedBuildsPanel />

      <BuildSummary />

      <EmptyState
        v-if="favoriteSkills.length === 0"
        :text="t('ui.builder.empty')"
        :showAction="true"
        :actionText="t('ui.builder.goDictionary')"
        @action="router.push('/')"
      >
        <template #icon>
          <BookOpen :size="48" />
        </template>
      </EmptyState>

      <div v-else ref="skillGridRef" class="skill-grid">
        <SkillCard
          v-for="(skill, index) in favoriteSkills"
          :key="skill.id"
          :data-id="skill.id"
          :skill="skill"
          :hasConflict="conflicts.has(skill.id)"
          :conflictBases="conflicts.get(skill.id) || []"
          reorderable
          :isFirst="index === 0"
          :isLast="index === favoriteSkills.length - 1"
          @move="(delta) => favoritesStore.moveFavorite(skill.id, delta)"
        />
      </div>
    </div>

    <Modal :show="showShareModal" :title="t('ui.builder.shareModalTitle')" @close="showShareModal = false">
      <div class="share-content">
        <input type="text" readonly :value="shareUrl" class="text-input" @click="$event.target.select()" />
        <button class="btn btn-primary share-copy-btn" @click="copyWithFeedback(shareUrl)">
          {{ t('ui.builder.copyUrl') }}
        </button>
      </div>
    </Modal>

    <ConfirmDialog
      v-model:show="showImportConfirm"
      :title="t('ui.builder.importConfirmTitle')"
      :message="importConfirmMessage"
      :confirmText="t('ui.builder.importConfirmTitle')"
      :cancelText="t('ui.cancel')"
      @confirm="executeImport"
      @cancel="cancelImportAny"
    />

    <SaveBuildModal v-model:show="showSaveModal" />

    <Modal :show="showExportChoiceModal" :title="t('ui.builder.exportChoiceTitle')" @close="showExportChoiceModal = false">
      <div class="export-choice-content">
        <button class="btn btn-primary export-btn" @click="doExport('current')" :disabled="favoriteSkills.length === 0">
          <Share2 :size="18" />
          {{ t('ui.builder.exportCurrent') }}
        </button>
        <button class="btn btn-primary export-btn" @click="doExport('saves')">
          <Save :size="18" />
          {{ t('ui.builder.exportSaves') }} ({{ savedBuilds.length }})
        </button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.builder-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.builder-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--bg-dark);
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: background-color 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-area h2 {
  margin: 0;
  font-size: 1.35rem;
  white-space: nowrap;
}

.slot-count {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 3px 10px;
  white-space: nowrap;
  border-radius: 999px;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  color: var(--accent-cyan);
}

.slot-count.over {
  background: var(--danger-bg);
  border-color: var(--danger-border);
  color: var(--danger);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  height: 52px;
}

.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.conflict-banner {
  background: var(--danger-bg);
  border: 1px solid var(--danger-border);
  color: var(--danger);
}

.limit-banner {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  color: var(--warning);
}

.build-content {
  padding: 16px;
  flex: 1;
}

.build-summary {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-cyan);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.summary-list {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto 1fr auto;
  align-items: center;
  column-gap: 8px;
}

.summary-item {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  user-select: none; /* 防止長按文字時反白 */
}

.summary-item > span {
  padding: 10px 0;
  border-bottom: 1px dashed var(--glass-border);
}

.summary-item.last-item > span {
  border-bottom: none;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.summary-actions:last-child {
  flex-direction: row;
}

.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-icon:hover:not(:disabled) {
  background: var(--glass-border);
  color: var(--text-primary);
}

.action-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-icon.delete-icon {
  padding: 6px;
}

.action-icon.delete-icon:hover {
  background: var(--danger-bg);
  color: var(--danger);
}

.skill-name {
  color: var(--accent-cyan);
  font-weight: 700;
  text-shadow: 0 0 8px var(--accent-cyan-glow);
  text-align: right;
}

.operator {
  color: var(--text-muted);
  font-weight: bold;
  text-align: center;
  padding: 10px 4px !important;
}

.main-skill {
  color: var(--accent-cyan);
  text-align: center;
}

.sub-skill {
  color: var(--accent-purple);
  text-align: left;
}

.enchant {
  font-size: 0.85em;
  opacity: 0.9;
}

.skill-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.share-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.share-copy-btn {
  align-self: flex-end;
}

.export-choice-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-btn {
  justify-content: center;
  gap: 12px;
}

@media (max-width: 640px) {
  .btn-text-content {
    display: none;
  }
  .action-btn {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
