<script setup>
import { computed, ref } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useSavedBuildsStore } from '@/stores/savedBuilds'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import { Save, Trash2, Download } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { skillsById } from '@/data'
import { formatDate } from '@/utils/format'

const favoritesStore = useFavoritesStore()
const savedBuildsStore = useSavedBuildsStore()
const settingsStore = useSettingsStore()
const toastStore = useToastStore()
const { t } = useI18n()

const showClearSavedConfirm = ref(false)
const handleClearSaved = () => {
  showClearSavedConfirm.value = true
}
const clearSavedBuilds = () => {
  savedBuildsStore.clearSavedBuilds()
  showClearSavedConfirm.value = false
}

const handleDeleteSavedBuild = (id) => {
  const index = savedBuildsStore.savedBuilds.findIndex(b => b.id === id)
  const build = savedBuildsStore.savedBuilds[index]
  
  if (build) {
    const buildCopy = JSON.parse(JSON.stringify(build)) // deep clone to prevent reactivity issues
    savedBuildsStore.deleteSavedBuild(id)

    if (settingsStore.notificationPrefs.deleteSavedBuild) {
      toastStore.showUndoToast(
        t('ui.builder.deletedBuildMsg', buildCopy.name),
        t('ui.undo'),
        () => {
          savedBuildsStore.restoreBuild(buildCopy, index)
        }
      )
    }
  }
}

// 讀取存檔＝把存檔的技能組套用為當前配技
const loadBuild = (build) => {
  favoritesStore.setFavorites(build.skills)
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
      savedBuildsStore.renameBuild(editingBuildId.value, editingBuildName.value.trim())
    }
    editingBuildId.value = null
  }
}

// Compute the enriched builds array with pre-calculated summary objects
const enrichedSavedBuilds = computed(() => {
  return savedBuildsStore.savedBuilds.map(build => {
    let summaryLines = []
    if (build.skills && build.skills.length > 0) {
      summaryLines = build.skills.map(id => {
        const s = skillsById.get(id)
        if (!s) return null
        return {
          fusionName: s.name,
          mainName: s.mainSkill?.name,
          mainEnchant: s.mainSkill?.enchant,
          subName: s.subSkill?.name,
          subEnchant: s.subSkill?.enchant
        }
      }).filter(Boolean)
    }
    return {
      ...build,
      summaryLines
    }
  })
})
</script>

<template>
  <div class="saved-builds-section" v-if="enrichedSavedBuilds.length > 0">
    <div class="section-header">
      <h3 class="section-title"><Save :size="18" /> {{ t('ui.builder.savedBuilds') }} ({{ enrichedSavedBuilds.length }}/{{ savedBuildsStore.maxSavedBuilds }})</h3>
      <button class="btn btn-text btn-sm" @click="handleClearSaved">
        <Trash2 :size="14" /> {{ t('ui.builder.clear') }}
      </button>
    </div>
    <div class="saved-builds-container">
      <div v-for="build in enrichedSavedBuilds" :key="build.id" class="saved-build-card glass-panel" @click="loadBuild(build)">
        <div class="saved-build-header">
          <template v-if="editingBuildId === build.id">
            <input 
              type="text" 
              v-model="editingBuildName" 
              @blur="finishEditingBuild"
              @keyup.enter="finishEditingBuild"
              @click.stop
              class="inline-edit-input"
              v-focus
            />
          </template>
          <span v-else class="saved-build-name" @click.stop="startEditingBuild(build)" :title="t('ui.builder.saveTitle')">
            {{ build.name }}
          </span>
          <span class="saved-build-date">{{ formatDate(build.date) }}</span>
        </div>
        <div class="saved-build-summary">
          <div v-for="(line, idx) in build.summaryLines" :key="idx" class="summary-line">
            <span class="icon-text"><GameIcon :name="line.fusionName" category="fusion" class="list-mini-icon" /> {{ t(line.fusionName) }}</span> = 
            <span class="icon-text"><GameIcon :name="line.mainName" category="skill" class="list-mini-icon" /> {{ t(line.mainName) }}</span><span v-if="line.mainEnchant">({{ t(line.mainEnchant) }})</span> + 
            <span class="icon-text"><GameIcon :name="line.subName" category="skill" class="list-mini-icon" /> {{ t(line.subName) }}</span><span v-if="line.subEnchant">({{ t(line.subEnchant) }})</span>
          </div>
        </div>
        <div class="saved-build-actions">
          <button class="btn btn-text btn-sm" @click.stop="loadBuild(build)">
            <Download :size="14" /> {{ t('ui.builder.load') }}
          </button>
          <button class="btn btn-danger-text btn-sm" @click.stop="handleDeleteSavedBuild(build.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:show="showClearSavedConfirm"
      :title="t('ui.builder.clear')"
      :message="t('ui.builder.clearSavedConfirm')"
      :confirmText="t('ui.builder.clear')"
      :cancelText="t('ui.cancel')"
      @confirm="clearSavedBuilds"
    />
  </div>
</template>

<style scoped>
.saved-builds-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  flex-direction: column;
  gap: 12px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 4px;
}

.saved-build-card {
  width: 100%;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.saved-build-card:hover {
  border-color: rgba(0, 230, 255, 0.3);
  transform: translateY(-2px);
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.list-mini-icon {
  --icon-size: var(--icon-size-list-mini);
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
</style>
