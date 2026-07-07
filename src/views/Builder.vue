<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import SkillCard from '@/components/SkillCard.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Share2, Trash2, AlertTriangle, BookOpen, Layers, Sparkles, Save, Download, X } from '@lucide/vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { skillsById } from '@/data'

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()
const { t } = useI18n()
const router = useRouter()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)
const conflicts = computed(() => favoritesStore.conflicts)

const route = useRoute()

const showShareModal = ref(false)
const shareUrl = ref('')
const showImportConfirm = ref(false)
const showImportSavesConfirm = ref(false)
const importData = ref(null)
const showExportChoiceModal = ref(false)

const savedBuilds = computed(() => favoritesStore.savedBuilds)
const showSaveModal = ref(false)
const saveNameInput = ref('')
const saveMode = ref('new')

const handleSaveClick = () => {
  if (favoriteSkills.value.length === 0) return
  if (savedBuilds.value.length >= 10) {
    saveMode.value = savedBuilds.value[0].id
    saveNameInput.value = savedBuilds.value[0].name
  } else {
    saveMode.value = 'new'
    saveNameInput.value = `${t('ui.builder.defaultSaveName')} ${savedBuilds.value.length + 1}`
  }
  showSaveModal.value = true
}

watch(saveMode, (newMode) => {
  if (newMode === 'new') {
    saveNameInput.value = `${t('ui.builder.defaultSaveName')} ${savedBuilds.value.length + 1}`
  } else {
    const build = savedBuilds.value.find(b => b.id === newMode)
    if (build) saveNameInput.value = build.name
  }
})

const confirmSave = () => {
  const name = saveNameInput.value.trim() || t('ui.builder.defaultSaveName')
  if (saveMode.value === 'new') {
    if (favoritesStore.saveBuild(name)) {
      toastStore.showToast(t('ui.builder.saveSuccess'), 'success')
      showSaveModal.value = false
    }
  } else {
    favoritesStore.overwriteBuild(saveMode.value)
    favoritesStore.renameBuild(saveMode.value, name)
    toastStore.showToast(t('ui.builder.saveSuccess'), 'success')
    showSaveModal.value = false
  }
}

const getSavedBuildSummaryArray = (build) => {
  if (!build.skills || build.skills.length === 0) return []
  return build.skills.map(id => {
    const s = skillsById.get(id)
    if (!s) return ''
    const mainEnchant = s.mainSkill?.enchant ? `(${t(s.mainSkill.enchant)})` : ''
    const subEnchant = s.subSkill?.enchant ? `(${t(s.subSkill.enchant)})` : ''
    return `${t(s.name)}=${t(s.mainSkill?.name)}${mainEnchant}+${t(s.subSkill?.name)}${subEnchant}`
  }).filter(Boolean)
}

const showClearSavedConfirm = ref(false)
const handleClearSaved = () => {
  showClearSavedConfirm.value = true
}
const clearSavedBuilds = () => {
  favoritesStore.clearSavedBuilds()
  showClearSavedConfirm.value = false
}

const editingBuildId = ref(null)
const editingBuildName = ref('')
const startEditingBuild = (build) => {
  editingBuildId.value = build.id
  editingBuildName.value = build.name
}
const finishEditingBuild = () => {
  if (editingBuildId.value) {
    if (editingBuildName.value.trim()) {
      favoritesStore.renameBuild(editingBuildId.value, editingBuildName.value.trim())
    }
    editingBuildId.value = null
  }
}

const vFocus = {
  mounted: (el) => el.focus()
}

const formatDate = (ts) => {
  return new Date(ts).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
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
  
  const base64Str = btoa(encodeURIComponent(JSON.stringify(dataObj)))
  const base = window.location.origin + window.location.pathname
  const url = `${base}#/builder?share=${base64Str}`
  
  shareUrl.value = url

  try {
    await navigator.clipboard.writeText(url)
    toastStore.showToast(t('ui.builder.exportSuccess'), 'success')
  } catch {
    toastStore.showToast(t('ui.builder.exportFail'), 'warning')
  }
  
  showShareModal.value = true
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    toastStore.showToast(t('ui.builder.exportSuccess'), 'success')
  } catch {
    toastStore.showToast(t('ui.builder.exportFail'), 'warning')
  }
}

const processImportData = (obj) => {
  if (!obj || !obj.type || !obj.data) return
  importData.value = obj
  
  if (obj.type === 'current') {
    if (favoritesStore.favoriteIds.length === 0) {
      executeImport()
    } else {
      showImportConfirm.value = true
    }
  } else if (obj.type === 'saves') {
    if (favoritesStore.savedBuilds.length === 0) {
      executeImport()
    } else {
      showImportSavesConfirm.value = true
    }
  }
}

const executeImport = () => {
  if (!importData.value) return
  if (importData.value.type === 'current') {
    favoritesStore.setFavorites(importData.value.data)
  } else if (importData.value.type === 'saves') {
    favoritesStore.setSavedBuilds(importData.value.data)
  }
  toastStore.showToast(t('ui.builder.importSuccess'), 'success')
  router.replace({ query: {} })
  importData.value = null
}

const cancelImportAny = () => {
  router.replace({ query: {} })
  importData.value = null
}

watch(() => route.query.share, (newShare) => {
  if (newShare) {
    try {
      const jsonStr = decodeURIComponent(atob(newShare))
      const obj = JSON.parse(jsonStr)
      processImportData(obj)
    } catch (e) {
      console.error('Failed to parse share query', e)
      router.replace({ query: {} })
    }
  }
}, { immediate: true })

const clearAll = () => {
  const backup = [...favoritesStore.favoriteIds]
  favoritesStore.clearFavorites()
  toastStore.showToast(t('ui.builder.clearedMsg'), 'info', {
    duration: 6000,
    actionLabel: t('ui.restore'),
    onAction: () => favoritesStore.setFavorites(backup),
  })
}
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
          <HeaderActions compact />
        </div>
      </div>
      <div v-if="favoritesStore.isOverLimit" class="banner limit-banner">
        <Layers :size="20" />
        <span>{{ t('ui.builder.limitWarning').replace('{0}', favoritesStore.maxSlots) }}</span>
      </div>
      <div v-if="conflicts.size > 0" class="banner conflict-banner">
        <AlertTriangle :size="20" />
        <span>{{ t('ui.builder.conflictWarning') }}</span>
      </div>
    </header>

    <div class="build-content">
      <div v-if="savedBuilds.length > 0" class="saved-builds-section">
        <div class="section-header">
          <h3 class="section-title"><Save :size="18" /> {{ t('ui.builder.savedBuilds') }} ({{ savedBuilds.length }}/10)</h3>
          <button class="btn btn-text btn-sm" @click="handleClearSaved">
            <Trash2 :size="14" /> {{ t('ui.builder.clear') }}
          </button>
        </div>
        <div class="saved-builds-container">
          <div v-for="build in savedBuilds" :key="build.id" class="saved-build-card glass-panel">
            <div class="saved-build-header">
              <template v-if="editingBuildId === build.id">
                <input 
                  type="text" 
                  v-model="editingBuildName" 
                  @blur="finishEditingBuild"
                  @keyup.enter="finishEditingBuild"
                  class="inline-edit-input"
                  v-focus
                />
              </template>
              <span v-else class="saved-build-name" @click="startEditingBuild(build)" :title="t('ui.builder.saveTitle')">
                {{ build.name }}
              </span>
              <span class="saved-build-date">{{ formatDate(build.date) }}</span>
            </div>
            <div class="saved-build-summary">
              <div v-for="(line, idx) in getSavedBuildSummaryArray(build)" :key="idx" class="summary-line">
                {{ line }}
              </div>
            </div>
            <div class="saved-build-actions">
              <button class="btn btn-text btn-sm" @click="favoritesStore.loadSavedBuild(build.id)">
                <Download :size="14" /> {{ t('ui.builder.load') }}
              </button>
              <button class="btn btn-danger-text btn-sm" @click="favoritesStore.deleteSavedBuild(build.id)">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="build-summary glass-panel" v-if="favoriteSkills.length > 0">
        <h3 class="summary-title"><Sparkles :size="18" /> {{ t('ui.builder.summaryTitle') }}</h3>
        <div class="summary-list">
          <div v-for="(skill, index) in favoriteSkills" :key="'summary-' + skill.id" class="summary-item" :class="{ 'last-item': index === favoriteSkills.length - 1 }">
            <span class="skill-name">{{ t(skill.name) }}</span>
            <span class="operator">=</span>
            <span class="skill-part main-skill">
              {{ t(skill.mainSkill.name) }}
              <span v-if="skill.mainSkill.enchant" class="enchant">({{ t(skill.mainSkill.enchant) }})</span>
            </span>
            <span class="operator">+</span>
            <span class="skill-part sub-skill">
              {{ t(skill.subSkill.name) }}
              <span v-if="skill.subSkill.enchant" class="enchant">({{ t(skill.subSkill.enchant) }})</span>
            </span>
          </div>
        </div>
      </div>

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

      <TransitionGroup v-else tag="div" name="card-move" class="skill-grid">
        <SkillCard
          v-for="(skill, index) in favoriteSkills"
          :key="skill.id"
          :skill="skill"
          :hasConflict="conflicts.has(skill.id)"
          :conflictBases="conflicts.get(skill.id) || []"
          reorderable
          :isFirst="index === 0"
          :isLast="index === favoriteSkills.length - 1"
          @move="(delta) => favoritesStore.moveFavorite(skill.id, delta)"
        />
      </TransitionGroup>
    </div>

    <Modal :show="showShareModal" :title="t('ui.builder.shareModalTitle')" @close="showShareModal = false">
      <div class="share-content">
        <input type="text" readonly :value="shareUrl" class="share-input" @click="$event.target.select()" />
        <button class="btn btn-primary share-copy-btn" @click="copyShareUrl">
          {{ t('ui.builder.copyUrl') }}
        </button>
      </div>
    </Modal>

    <ConfirmDialog
      v-model:show="showImportConfirm"
      :title="t('ui.builder.importConfirmTitle')"
      :message="t('ui.builder.importConfirmMsg')"
      :confirmText="t('ui.builder.importConfirmTitle')"
      :cancelText="t('ui.cancel')"
      @confirm="executeImport"
      @cancel="cancelImportAny"
    />

    <ConfirmDialog
      v-model:show="showImportSavesConfirm"
      :title="t('ui.builder.importConfirmTitle')"
      :message="t('ui.builder.importSavesConfirmMsg')"
      :confirmText="t('ui.builder.importConfirmTitle')"
      :cancelText="t('ui.cancel')"
      @confirm="executeImport"
      @cancel="cancelImportAny"
    />

    <ConfirmDialog
      v-model:show="showClearSavedConfirm"
      :title="t('ui.builder.clear')"
      :message="t('ui.builder.clearSavedConfirm')"
      :confirmText="t('ui.builder.clear')"
      :cancelText="t('ui.cancel')"
      @confirm="clearSavedBuilds"
    />

    <Modal :show="showSaveModal" :title="t('ui.builder.saveTitle')" @close="showSaveModal = false">
      <div class="save-content">
        <div class="save-field">
          <label>{{ t('ui.builder.savePlaceholder') }}</label>
          <input 
            type="text" 
            v-model="saveNameInput" 
            :placeholder="t('ui.builder.savePlaceholder')"
            class="share-input" 
            @keyup.enter="confirmSave"
            v-focus
          />
        </div>
        <div class="save-field">
          <label>{{ t('ui.builder.saveTarget') }}</label>
          <div class="save-options">
            <label v-if="savedBuilds.length < 10" class="save-option-label glass-panel" :class="{ active: saveMode === 'new' }">
              <input type="radio" v-model="saveMode" value="new" class="hidden-radio" />
              <div class="save-option-content">
                <span class="save-option-name">{{ t('ui.builder.createNewSave') }}</span>
              </div>
            </label>
            <label v-for="build in savedBuilds" :key="build.id" class="save-option-label glass-panel" :class="{ active: saveMode === build.id }">
              <input type="radio" v-model="saveMode" :value="build.id" class="hidden-radio" />
              <div class="save-option-content">
                <span class="save-option-name">{{ build.name }}</span>
                <span class="save-option-date">{{ formatDate(build.date) }}</span>
              </div>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-text" @click="showSaveModal = false">{{ t('ui.cancel') }}</button>
          <button class="btn btn-primary" @click="confirmSave">{{ t('ui.builder.save') }}</button>
        </div>
      </div>
    </Modal>

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

.saved-builds-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: var(--text-primary);
  margin: 0;
}

.saved-builds-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 12px;
  scroll-snap-type: x mandatory;
}

.saved-build-card {
  min-width: 260px;
  max-width: 280px;
  flex-shrink: 0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-snap-align: start;
}

.saved-build-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saved-build-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: text;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;
}

.saved-build-name:hover {
  border-bottom-color: var(--accent-cyan);
}

.inline-edit-input {
  background: var(--bg-dark);
  border: 1px solid var(--accent-cyan);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0 4px;
  width: 140px;
  outline: none;
}

.saved-build-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.saved-build-summary {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.saved-build-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  border-top: 1px dashed var(--glass-border);
  padding-top: 8px;
  margin-top: auto;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 0.8rem;
  height: 32px;
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
  grid-template-columns: 1fr auto auto auto 1fr;
  align-items: center;
  column-gap: 8px;
}

.summary-item {
  display: contents;
}

.summary-item > span {
  padding: 10px 0;
  border-bottom: 1px dashed var(--glass-border);
}

.summary-item.last-item > span {
  border-bottom: none;
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

.share-input {
  width: 100%;
  padding: 12px;
  background: var(--bg-dark);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.9rem;
}

.share-input:focus {
  outline: 1px solid var(--accent-cyan);
}

.share-copy-btn {
  align-self: flex-end;
}

.save-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.save-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.save-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.save-option-label {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.save-option-label:hover {
  background: var(--bg-hover);
}

.save-option-label.active {
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
}

.hidden-radio {
  display: none;
}

.save-option-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.save-option-name {
  font-weight: 600;
  color: var(--text-primary);
}

.save-option-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.export-choice-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  font-size: 1.05rem;
}
@media (min-width: 768px) {
  .skill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  .card-move-leave-active {
    width: auto;
  }
}

@media (max-width: 480px) {
  .btn-text-content {
    display: none;
  }
  .action-btn {
    padding: 0 8px;
    min-width: 40px;
  }
}
</style>
