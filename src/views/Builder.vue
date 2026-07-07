<script setup>
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import SkillCard from '@/components/SkillCard.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { Share2, Trash2, AlertTriangle, BookOpen, Layers } from '@lucide/vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()
const { t } = useI18n()
const router = useRouter()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)
const conflicts = computed(() => favoritesStore.conflicts)

const buildExportText = () => {
  let exportText = `${t('ui.builder.exportHeader')}\n\n`
  favoriteSkills.value.forEach((skill, index) => {
    exportText += `${index + 1}. ${t(skill.name)}\n`
    exportText += `   - ${t('ui.builder.exportMain')}: ${t(skill.mainSkill.name)} ${skill.mainSkill.enchant ? `(${t(skill.mainSkill.enchant)})` : ''}\n`
    exportText += `   - ${t('ui.builder.exportSub')}: ${t(skill.subSkill.name)} ${skill.subSkill.enchant ? `(${t(skill.subSkill.enchant)})` : ''}\n`
    if (skill.requirements?.ultimate) {
      exportText += `   - ${t('ui.builder.exportUltimate')}: ${t(skill.requirements.ultimate)}\n`
    }
    if (skill.requirements?.school) {
      exportText += `   - ${t('ui.builder.exportSchool')}: ${t(skill.requirements.school)}\n`
    }
    if (skill.requirements?.subject) {
      exportText += `   - ${t('ui.builder.exportSubject')}: ${t(skill.requirements.subject)}\n`
    }
    exportText += '\n'
  })

  if (conflicts.value.size > 0) {
    exportText += `${t('ui.builder.exportConflict')}\n`
  }
  return exportText
}

const exportBuild = async () => {
  if (favoriteSkills.value.length === 0) {
    toastStore.showToast(t('ui.builder.exportEmpty'), 'warning')
    return
  }

  const exportText = buildExportText()

  // 手機優先走系統分享面板
  if (navigator.share) {
    try {
      await navigator.share({ title: t('ui.builder.title'), text: exportText })
      return
    } catch (err) {
      if (err.name === 'AbortError') return // 使用者取消分享
      // 其他錯誤退回剪貼簿
    }
  }

  try {
    await navigator.clipboard.writeText(exportText)
    toastStore.showToast(t('ui.builder.exportSuccess'), 'success')
  } catch {
    toastStore.showToast(t('ui.builder.exportFail'), 'warning')
  }
}

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
  height: 40px;
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



.skill-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
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
