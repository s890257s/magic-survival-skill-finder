<script setup>
import { ref } from 'vue'
import { Share2, Save, FolderOpen, AlertTriangle, Layers } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useSavedBuildsStore } from '@/stores/savedBuilds'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { useShareBuild } from '@/composables/useShareBuild'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BuildSummary from '@/components/builder/BuildSummary.vue'
import SaveBuildModal from '@/components/builder/SaveBuildModal.vue'
import SavedBuildsPanel from '@/components/builder/SavedBuildsPanel.vue'

const favoritesStore = useFavoritesStore()
const savedBuildsStore = useSavedBuildsStore()
const toastStore = useToastStore()
const { t } = useI18n()

const {
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
} = useShareBuild()

const showSaveModal = ref(false)
const showSavedBuildsModal = ref(false)

const handleSaveClick = () => {
  if (favoritesStore.favoriteSkills.length === 0) return
  showSaveModal.value = true
}

const clearFavoritesWithUndo = () => {
  if (favoritesStore.favoriteIds.length === 0) return
  const backup = [...favoritesStore.favoriteIds]
  favoritesStore.clearFavorites()
  toastStore.showUndoToast(t('ui.builder.clearedMsg'), t('ui.restore'), () =>
    favoritesStore.setFavorites(backup),
  )
}
</script>

<template>
  <div class="build-panel">
    <!-- 工具列（原抽屜 header 的動作鈕） -->
    <div class="panel-toolbar">
      <button class="action-btn" @click="showSavedBuildsModal = true" :title="t('ui.builder.savedBuilds')">
        <FolderOpen :size="18" />
      </button>
      <button class="action-btn" @click="handleSaveClick" :disabled="favoritesStore.favoriteSkills.length === 0" :title="t('ui.builder.save')">
        <Save :size="18" />
      </button>
      <button class="action-btn" @click="openExportModal" :title="t('ui.builder.export')">
        <Share2 :size="18" />
      </button>
      <div class="action-divider"></div>
      <button class="text-action danger" @click="clearFavoritesWithUndo" :disabled="favoritesStore.favoriteSkills.length === 0">
        {{ t('ui.builder.clear') }}
      </button>
    </div>

    <!-- Banners -->
    <div v-if="favoritesStore.isOverLimit" class="banner limit-banner">
      <Layers :size="16" />
      <span>{{ t('ui.builder.limitWarning', favoritesStore.maxSlots) }}</span>
    </div>
    <div v-if="favoritesStore.conflicts.size > 0" class="banner conflict-banner">
      <AlertTriangle :size="16" />
      <span>{{ t('ui.builder.conflictWarning') }}</span>
    </div>

    <div v-if="favoritesStore.favoriteSkills.length === 0" class="section-empty-state">
      {{ t('ui.builder.empty') }}
    </div>
    <BuildSummary v-else />

    <!-- Modals -->
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
      @cancel="cancelImport"
    />

    <SaveBuildModal v-model:show="showSaveModal" />

    <Modal
      :show="showExportChoiceModal"
      :title="t('ui.builder.exportChoiceTitle')"
      @close="showExportChoiceModal = false"
    >
      <div class="export-choice-content">
        <button class="btn btn-primary export-btn" @click="doExport('current')" :disabled="favoritesStore.favoriteSkills.length === 0">
          <Share2 :size="18" />
          {{ t('ui.builder.exportCurrent') }}
        </button>
        <button class="btn btn-primary export-btn" @click="doExport('saves')">
          <Save :size="18" />
          {{ t('ui.builder.exportSaves') }} ({{ savedBuildsStore.savedBuilds.length }})
        </button>
      </div>
    </Modal>

    <Modal :show="showSavedBuildsModal" :title="t('ui.builder.savedBuilds')" @close="showSavedBuildsModal = false">
      <div v-if="savedBuildsStore.savedBuilds.length === 0" class="section-empty-state">
        {{ t('ui.builder.empty') }}
      </div>
      <SavedBuildsPanel v-else />
    </Modal>
  </div>
</template>

<style scoped>
.build-panel {
  padding-bottom: 16px;
  /* 面板為固定高度，內容以縱向 flex 佈局讓空狀態能置中 */
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.build-panel > :deep(.build-summary) {
  flex-shrink: 0;
}

.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--glass-border);
  position: sticky;
  top: 0;
  background: var(--bg-surface);
  z-index: 1;
}

/* .action-btn / .text-action / .action-divider 為全域樣式（main.css） */

/* 空狀態基底在全域 .section-empty-state，此處補固定高度面板的置中排版 */
.section-empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 12px 16px 0 16px;
  border-radius: 6px;
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

.share-content,
.export-choice-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-choice-content { gap: 12px; }

.share-copy-btn { align-self: flex-end; }
.export-btn { justify-content: center; gap: 12px; }
</style>
