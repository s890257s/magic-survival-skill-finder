<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Sortable from 'sortablejs'
import { Search, Pin, Sparkles, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Book, Share2, Save, FolderOpen, AlertTriangle, Layers } from '@lucide/vue'
import { skillsData } from '@/data'
import { gameVersion } from '@/data/meta'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import SkillCard from '@/components/SkillCard.vue'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useFavoritesStore } from '@/stores/favorites'
import { useDictionaryStore } from '@/stores/dictionary'
import EmptyState from '@/components/ui/EmptyState.vue'
import BuildSummary from '@/components/builder/BuildSummary.vue'
import { useI18n } from '@/composables/useI18n'
import DictionaryTopBar from '@/components/dictionary/DictionaryTopBar.vue'

// Import Builder components and utils
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SavedBuildsPanel from '@/components/builder/SavedBuildsPanel.vue'
import SaveBuildModal from '@/components/builder/SaveBuildModal.vue'
import { useRouter, useRoute } from 'vue-router'
import { exportDataToToken, parseTokenToData } from '@/utils/share'

const pinnedStore = usePinnedStore()
const toastStore = useToastStore()
const favoritesStore = useFavoritesStore()
const dictionaryStore = useDictionaryStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const filters = dictionaryStore.filters
const ui = dictionaryStore.ui
const { resetAll } = dictionaryStore

const conflicts = computed(() => favoritesStore.conflicts)
const savedBuilds = computed(() => favoritesStore.savedBuilds)

const showShareModal = ref(false)
const shareUrl = ref('')
const showImportConfirm = ref(false)
const importData = ref(null)
const showExportChoiceModal = ref(false)
const showSaveModal = ref(false)
const showSavedBuildsModal = ref(false)

const importConfirmMessage = computed(() =>
  importData.value?.type === 'saves'
    ? t('ui.builder.importSavesConfirmMsg')
    : t('ui.builder.importConfirmMsg'),
)

const handleSaveClick = () => {
  if (favoritesStore.favoriteSkills.length === 0) return
  showSaveModal.value = true
}

const openExportModal = () => {
  if (favoritesStore.favoriteSkills.length === 0 && savedBuilds.value.length === 0) {
    toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
    return
  }
  if (savedBuilds.value.length === 0) {
    doExport('current')
  } else {
    showExportChoiceModal.value = true
  }
}

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
    if (favoritesStore.favoriteSkills.length === 0) {
      toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
      return
    }
    dataObj = { type: 'current', data: favoritesStore.favoriteSkills.map(s => s.id) }
  } else if (type === 'saves') {
    dataObj = { type: 'saves', data: savedBuilds.value }
  }

  const token = exportDataToToken(dataObj)
  const base = window.location.origin + window.location.pathname
  shareUrl.value = `${base}#/?share=${token}`

  await copyWithFeedback(shareUrl.value)
  showShareModal.value = true
}

const processImportData = (obj) => {
  if (!obj || !obj.type || !obj.data) return
  importData.value = obj

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

const clearFavoritesWithUndo = () => {
  if (favoritesStore.favoriteIds.length === 0) return
  const backup = [...favoritesStore.favoriteIds]
  favoritesStore.clearFavorites()
  toastStore.showUndoToast(t('ui.builder.clearedMsg'), t('ui.restore'), () =>
    favoritesStore.setFavorites(backup),
  )
}

const onSelectBase = (name) => {
  if (filters.baseSkill !== name) {
    filters.baseSkill = name
    filters.enchant = ''
  }
}

const onSelectEnchant = ({ baseName, enchantName }) => {
  filters.baseSkill = baseName
  filters.enchant = enchantName
}

const onSelectSubject = (name) => {
  if (filters.subject !== name) {
    filters.subject = name
  }
}

const usedBases = computed(() => {
  const bases = new Set()
  favoritesStore.favoriteSkills.forEach(skill => {
    if (skill.mainSkill?.name) bases.add(skill.mainSkill.name)
    if (skill.subSkill?.name) bases.add(skill.subSkill.name)
  })
  return bases
})

const filteredSkills = computed(() => {
  return skillsData.filter((skill) => {
    const searchTerms = [
      ...(filters.searchTags || []),
      filters.search.trim()
    ].filter(Boolean).map(t => t.toLowerCase())

    if (searchTerms.length > 0) {
      if (searchTerms.some(q => !skill.searchText.includes(q))) return false
    }
    // 學派篩選：等待遊戲學派資料補齊，暫時停用
    if (
      filters.school &&
      skill.requirements?.school &&
      skill.requirements.school !== filters.school
    ) {
      return false
    }
    if (filters.subject && skill.requirements?.subject !== filters.subject) {
      return false
    }
    if (filters.baseSkill) {
      const matchMain = skill.mainSkill?.name === filters.baseSkill
      const matchSub = skill.subSkill?.name === filters.baseSkill
      if (!matchMain && !matchSub) return false

      if (filters.enchant) {
        let enchantMatched = false
        if (matchMain && skill.mainSkill?.enchant === filters.enchant) enchantMatched = true
        if (matchSub && skill.subSkill?.enchant === filters.enchant) enchantMatched = true
        if (!enchantMatched) return false
      }
    }
    if (filters.ultimate && !skill.requirements?.ultimate) {
      return false
    }
    if (filters.excludeConsumed) {
      const main = skill.mainSkill?.name
      const sub = skill.subSkill?.name
      if ((main && usedBases.value.has(main)) || (sub && usedBases.value.has(sub))) {
        return false
      }
    }
    return true
  })
})

const hasActiveFilters = computed(() => {
  return Boolean(filters.school || filters.subject || filters.baseSkill || filters.ultimate || filters.excludeConsumed)
})

const pinnedInView = computed(() => {
  return pinnedStore.pinnedIds
    .map(id => skillsData.find(s => s.id === id))
    .filter(Boolean)
})



const onMovePinned = (skill, delta) => {
  const visible = pinnedInView.value
  const index = visible.findIndex((s) => s.id === skill.id)
  const target = visible[index + delta]
  if (!target) return
  pinnedStore.swapPins(skill.id, target.id)
}

const unpinAll = () => {
  const backup = [...pinnedStore.pinnedIds]
  pinnedStore.clearPins()
  toastStore.showUndoToast(t('ui.dict.unpinnedAllMsg'), t('ui.restore'), () =>
    pinnedStore.setPins(backup),
  )
}

const pinnedCards = ref([])
const allSkillCards = ref([])

const setAllSectionsExpanded = (val) => {
  ui.isBuildSummaryExpanded = val
  ui.isPinnedExpanded = val
  ui.isOtherExpanded = val
  ui.isSearchExpanded = val
}



const toggleExpandAll = (cards, val) => {
  if (cards && cards.length) {
    cards.forEach(card => card?.setExpanded?.(val))
  }
}

const pinnedListRef = ref(null)
let sortable = null

const initSortable = () => {
  if (pinnedListRef.value && !sortable) {
    sortable = Sortable.create(pinnedListRef.value, {
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

  const itemEl = evt.item
  if (evt.from) {
    const siblings = Array.from(evt.from.childNodes).filter(node => node.nodeType === 1)
    if (oldIndex < siblings.length) {
      evt.from.insertBefore(itemEl, siblings[oldIndex])
    } else {
      evt.from.appendChild(itemEl)
    }
  }

  const visible = pinnedInView.value
  const skillId = visible[oldIndex]?.id
  if (!skillId) return

  const visibleIds = visible.map(s => s.id)
  const moved = visibleIds.splice(oldIndex, 1)[0]
  visibleIds.splice(newIndex, 0, moved)
  
  const newPins = []
  let visiblePtr = 0
  for (const id of pinnedStore.pinnedIds) {
    if (visible.some(s => s.id === id)) {
      newPins.push(visibleIds[visiblePtr])
      visiblePtr++
    } else {
      newPins.push(id)
    }
  }
  
  pinnedStore.setPins(newPins)
}

watch(() => pinnedInView.value.length, async () => {
  await nextTick()
  initSortable()
})

onMounted(() => {
  initSortable()
})

onBeforeUnmount(() => {
  if (sortable) sortable.destroy()
})
</script>

<template>
  <div class="dictionary-view">
    <div class="app-header-container">
      <div class="app-header-content">
        <div class="app-header">
          <h1 class="app-title">
            {{ t('ui.magicSurvival') }}
            <span class="version-tag">v{{ gameVersion }}</span>
          </h1>
        </div>
        <div class="header-actions-row">
          <HeaderActions />
          
          <div class="action-divider global-divider"></div>

          <button class="btn-icon-rounded global-collapse-btn" @click="setAllSectionsExpanded(true)" title="全部展開">
            <ChevronsDown :size="20" />
          </button>
          <button class="btn-icon-rounded global-collapse-btn" @click="setAllSectionsExpanded(false)" title="全部收合">
            <ChevronsUp :size="20" />
          </button>
        </div>
      </div>
      <hr class="header-divider" />
    </div>
    <div class="list-area">
      <!-- Section 1: Build Summary -->
      <div class="section-container">
        <div class="section-header clickable" @click="ui.isBuildSummaryExpanded = !ui.isBuildSummaryExpanded">
          <div class="section-title">
            <Sparkles :size="18" class="section-icon" />
            <span>{{ t('ui.builder.summaryTitle') }}</span>
            <span class="count-badge">{{ favoritesStore.favoriteSkills.length }}/{{ favoritesStore.maxSlots }}</span>
          </div>
          <div class="section-actions">
            <template v-if="ui.isBuildSummaryExpanded">
              <button class="btn-icon-text action-btn" @click.stop="showSavedBuildsModal = true" :title="t('ui.builder.savedBuilds')">
                <FolderOpen :size="16" />
              </button>
              <button class="btn-icon-text action-btn" @click.stop="handleSaveClick" :disabled="favoritesStore.favoriteSkills.length === 0" :title="t('ui.builder.save')">
                <Save :size="16" />
              </button>
              <button class="btn-icon-text action-btn" @click.stop="openExportModal" :title="t('ui.builder.export')">
                <Share2 :size="16" />
              </button>
              <div class="action-divider"></div>
              <button class="btn-text danger" @click.stop="clearFavoritesWithUndo" :disabled="favoritesStore.favoriteSkills.length === 0">
                {{ t('ui.builder.clear') }}
              </button>
              <div class="action-divider"></div>
            </template>
            <div class="collapse-icon">
              <ChevronUp v-if="ui.isBuildSummaryExpanded" :size="20" />
              <ChevronDown v-else :size="20" />
            </div>
          </div>
        </div>
        
        <div v-show="ui.isBuildSummaryExpanded">
          <!-- Banners -->
          <div v-if="favoritesStore.isOverLimit" class="banner limit-banner">
            <Layers :size="16" />
            <span>{{ t('ui.builder.limitWarning', favoritesStore.maxSlots) }}</span>
          </div>
          <div v-if="conflicts.size > 0" class="banner conflict-banner">
            <AlertTriangle :size="16" />
            <span>{{ t('ui.builder.conflictWarning') }}</span>
          </div>
          
          <div v-if="favoritesStore.favoriteSkills.length === 0" class="section-empty-state">
            {{ t('ui.builder.empty') }}
          </div>
          <div v-else>
            <BuildSummary hideHeader />
          </div>
        </div>
      </div>

      <!-- Section 2: Pinned Skills -->
      <div class="section-container">
        <div class="section-header clickable" @click="ui.isPinnedExpanded = !ui.isPinnedExpanded">
          <div class="section-title">
            <Pin :size="18" class="section-icon" />
            <span>{{ t('ui.dict.pinnedSkills') }}</span>
            <span class="count-badge">{{ pinnedStore.pinnedIds.length }}</span>
          </div>
          <div class="section-actions">
            <template v-if="ui.isPinnedExpanded">
              <button class="btn-text danger" @click.stop="unpinAll" :disabled="pinnedInView.length === 0">
                {{ t('ui.dict.unpinAll') }}
              </button>
              <div class="action-divider"></div>
              <button class="btn-text" @click.stop="toggleExpandAll(pinnedCards, true)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.expandSkills') }}</button>
              <button class="btn-text" @click.stop="toggleExpandAll(pinnedCards, false)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.collapseSkills') }}</button>
              <div class="action-divider"></div>
            </template>
            <div class="collapse-icon">
              <ChevronUp v-if="ui.isPinnedExpanded" :size="20" />
              <ChevronDown v-else :size="20" />
            </div>
          </div>
        </div>
        
        <div v-show="ui.isPinnedExpanded">
          <div v-if="pinnedInView.length === 0" class="section-empty-state">
            {{ t('ui.dict.emptyPinned') }}
          </div>
          <div v-else ref="pinnedListRef" class="skill-list pinned-list">
            <SkillCard
              v-for="(skill, index) in pinnedInView"
              :key="skill.id"
              ref="pinnedCards"
              :data-id="skill.id"
              :skill="skill"
              :hasConflict="favoritesStore.getConflictingWith(skill).length > 0"
              :conflictBases="favoritesStore.getConflictingWith(skill).map(c => c.base)"
              clickableBases
              pinnable
              :reorderable="pinnedInView.length > 1"
              :isFirst="index === 0"
              :isLast="index === pinnedInView.length - 1"
              :pinOrder="index + 1"
              @move="(delta) => onMovePinned(skill, delta)"
              @select-base="onSelectBase"
              @select-enchant="onSelectEnchant"
              @select-subject="onSelectSubject"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- DictionaryTopBar -->
    <DictionaryTopBar :resultCount="filteredSkills.length" />

    <div class="list-area">
      <!-- Main Content Empty State (Filters) -->
      <EmptyState
        v-if="filteredSkills.length === 0"
        :text="t('ui.dict.noResults')"
        :showAction="hasActiveFilters || filters.search !== '' || (filters.searchTags && filters.searchTags.length > 0)"
        :actionText="t('ui.resetSearchAndFilter')"
        @action="resetAll"
      >
        <template #icon>
          <Search :size="48" />
        </template>
      </EmptyState>

      <!-- Results (Other Skills) -->
      <div class="results-area" v-else>
        <!-- Section 3: Other Skills -->
        <div class="section-container">
          <div class="section-header clickable" @click="ui.isOtherExpanded = !ui.isOtherExpanded">
            <div class="section-title">
              <Book :size="18" class="section-icon" />
              <span>{{ t('ui.dict.allSkills') }}</span>
              <span class="count-badge">{{ filteredSkills.length }}</span>
            </div>
            <div class="section-actions">
              <template v-if="ui.isOtherExpanded">
                <button class="btn-text" @click.stop="toggleExpandAll(allSkillCards, true)" :disabled="filteredSkills.length === 0">{{ t('ui.dict.expandSkills') }}</button>
                <button class="btn-text" @click.stop="toggleExpandAll(allSkillCards, false)" :disabled="filteredSkills.length === 0">{{ t('ui.dict.collapseSkills') }}</button>
                <div class="action-divider"></div>
              </template>
              <div class="collapse-icon">
                <ChevronUp v-if="ui.isOtherExpanded" :size="20" />
                <ChevronDown v-else :size="20" />
              </div>
            </div>
          </div>
          
          <div v-show="ui.isOtherExpanded">
            <div v-if="filteredSkills.length > 0" class="skill-list unpinned-list">
              <SkillCard
                v-for="skill in filteredSkills"
                :key="skill.id"
                ref="allSkillCards"
                :data-id="skill.id"
                :skill="skill"
                :hasConflict="favoritesStore.getConflictingWith(skill).length > 0"
                :conflictBases="favoritesStore.getConflictingWith(skill).map(c => c.base)"
                clickableBases
                pinnable
                :reorderable="false"
                @select-base="onSelectBase"
                @select-enchant="onSelectEnchant"
                @select-subject="onSelectSubject"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
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
      @cancel="cancelImportAny"
    />

    <SaveBuildModal v-model:show="showSaveModal" />

    <Modal :show="showExportChoiceModal" :title="t('ui.builder.exportChoiceTitle')" @close="showExportChoiceModal = false">
      <div class="export-choice-content">
        <button class="btn btn-primary export-btn" @click="doExport('current')" :disabled="favoritesStore.favoriteSkills.length === 0">
          <Share2 :size="18" />
          {{ t('ui.builder.exportCurrent') }}
        </button>
        <button class="btn btn-primary export-btn" @click="doExport('saves')">
          <Save :size="18" />
          {{ t('ui.builder.exportSaves') }} ({{ savedBuilds.length }})
        </button>
      </div>
    </Modal>

    <Modal :show="showSavedBuildsModal" :title="t('ui.builder.savedBuilds')" @close="showSavedBuildsModal = false">
      <div v-if="savedBuilds.length === 0" class="section-empty-state">
        {{ t('ui.builder.empty') }}
      </div>
      <SavedBuildsPanel v-else />
    </Modal>
  </div>
</template>

<style scoped>
.dictionary-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.app-header-container {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
}

.app-header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 768px) {
  .app-header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.app-header {
  display: flex;
  align-items: center;
}

.header-actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.global-collapse-btn {
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.global-collapse-btn:hover {
  background: var(--glass-border);
  color: var(--text-primary);
}

.global-divider {
  margin: 0 4px;
}

.header-divider {
  border: 0;
  height: 1px;
  background: var(--glass-border);
  margin: 16px 0;
}

.app-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: var(--name-glow);
}

.version-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--accent-cyan-border);
  box-shadow: 0 0 10px var(--accent-cyan-glow);
  letter-spacing: 0.5px;
}


.list-area {
  scroll-margin-top: 96px;
}

.section-container {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 4px solid var(--accent-cyan);
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 16px;
  transition: background 0.2s ease;
}

.section-header.clickable {
  cursor: pointer;
  user-select: none;
}

.section-header.clickable:hover {
  background: rgba(255, 255, 255, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.section-icon {
  color: var(--accent-cyan);
}

.count-badge {
  background: var(--glass-bg);
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-divider {
  width: 1px;
  height: 14px;
  background: var(--glass-border);
}

.btn-text {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.btn-text:hover:not(:disabled) {
  color: var(--text-primary);
}

.btn-text.danger {
  color: var(--danger);
}

.btn-text.danger:hover:not(:disabled) {
  color: var(--danger-hover, #ff6b6b);
}

.btn-text:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.collapse-icon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s;
}

.section-header:hover .collapse-icon {
  color: var(--text-primary);
}

.section-empty-state {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 0 16px;
}

.skill-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.results-area {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .skill-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

.action-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0 16px 12px 16px;
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
</style>
