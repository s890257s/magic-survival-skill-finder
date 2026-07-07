<script setup>
import { computed, ref } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Save, Trash2, Download } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { skillsById } from '@/data'

const favoritesStore = useFavoritesStore()
const { t } = useI18n()

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

const formatDate = (ts) => {
  return new Date(ts).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
}

// Compute the enriched builds array with pre-calculated summary lines
const enrichedSavedBuilds = computed(() => {
  return favoritesStore.savedBuilds.map(build => {
    let summaryLines = []
    if (build.skills && build.skills.length > 0) {
      summaryLines = build.skills.map(id => {
        const s = skillsById.get(id)
        if (!s) return ''
        const mainEnchant = s.mainSkill?.enchant ? `(${t(s.mainSkill.enchant)})` : ''
        const subEnchant = s.subSkill?.enchant ? `(${t(s.subSkill.enchant)})` : ''
        return `${t(s.name)}=${t(s.mainSkill?.name)}${mainEnchant}+${t(s.subSkill?.name)}${subEnchant}`
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
      <h3 class="section-title"><Save :size="18" /> {{ t('ui.builder.savedBuilds') }} ({{ enrichedSavedBuilds.length }}/{{ favoritesStore.maxSavedBuilds }})</h3>
      <button class="btn btn-text btn-sm" @click="handleClearSaved">
        <Trash2 :size="14" /> {{ t('ui.builder.clear') }}
      </button>
    </div>
    <div class="saved-builds-container">
      <div v-for="build in enrichedSavedBuilds" :key="build.id" class="saved-build-card glass-panel">
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
          <div v-for="(line, idx) in build.summaryLines" :key="idx" class="summary-line">
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
</style>
