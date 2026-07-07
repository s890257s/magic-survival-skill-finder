<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import SkillCard from '@/components/SkillCard.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Share2, Trash2, AlertTriangle, BookOpen, Layers, Sparkles } from '@lucide/vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

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
const importIds = ref([])

const exportBuild = async () => {
  if (favoriteSkills.value.length === 0) {
    toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
    return
  }

  const ids = favoriteSkills.value.map(s => s.id).join(',')
  const base = window.location.origin + window.location.pathname
  const url = `${base}#/builder?build=${ids}`
  
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

const handleImport = () => {
  if (importIds.value.length > 0) {
    favoritesStore.setFavorites(importIds.value)
    toastStore.showToast(t('ui.builder.importSuccess'), 'success')
  }
  router.replace({ query: {} })
}

const cancelImport = () => {
  router.replace({ query: {} })
}

watch(() => route.query.build, (newBuild) => {
  if (newBuild) {
    const ids = newBuild.split(',').map(Number).filter(id => !isNaN(id))
    if (ids.length > 0) {
      importIds.value = ids
      if (favoritesStore.favoriteIds.length === 0) {
        handleImport()
      } else {
        showImportConfirm.value = true
      }
    } else {
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
          <button @click="exportBuild" class="btn btn-primary action-btn">
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
      @confirm="handleImport"
      @cancel="cancelImport"
    />
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
