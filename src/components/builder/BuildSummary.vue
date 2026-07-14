<script setup>
import { computed, ref } from 'vue'
import { Trash2, ChevronUp, ChevronDown, CheckCircle2 } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useTrackerStore } from '@/stores/tracker'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { useSortableList } from '@/composables/useSortableList'
import GameIcon from '@/components/ui/GameIcon.vue'

const favoritesStore = useFavoritesStore()
const trackerStore = useTrackerStore()
const toastStore = useToastStore()
const { t } = useI18n()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)

const removeWithUndo = (skill) => {
  const backupFavs = [...favoritesStore.favoriteIds]
  const backupTracker = [...trackerStore.acquiredBases]
  
  favoritesStore.toggleFavorite(skill.id)
  
  // 垃圾回收：如果移除後，該基礎技能已沒有其他配方使用，則同步取消打勾狀態
  const bases = [skill.mainSkill?.name, skill.subSkill?.name].filter(Boolean)
  bases.forEach((base) => {
    if (!favoritesStore.favoriteBaseUsage.has(base)) {
      trackerStore.removeAcquired(base)
    }
  })

  toastStore.showUndoToast(t('ui.card.removed', t(skill.name)), t('ui.restore'), () => {
    favoritesStore.setFavorites(backupFavs)
    trackerStore.setTracker(backupTracker)
  })
}

const summaryListRef = ref(null)
useSortableList(
  summaryListRef,
  (oldIndex, newIndex) => {
    const newIds = [...favoritesStore.favoriteIds]
    const movedId = newIds.splice(oldIndex, 1)[0]
    newIds.splice(newIndex, 0, movedId)
    favoritesStore.setFavorites(newIds)
  },
  { delay: 250, delayOnTouchOnly: true, filter: 'button', preventOnFilter: false },
)
</script>

<template>
  <div class="build-summary glass-panel" v-if="favoriteSkills.length > 0">
    <table class="summary-table">
      <colgroup>
        <col class="col-actions" />
        <col class="col-icon" />
        <col class="col-fusion-text" />
        <col class="col-operator" />
        <col class="col-icon" />
        <col class="col-main-text" />
        <col class="col-operator" />
        <col class="col-icon" />
        <col class="col-sub-text" />
        <col class="col-actions" />
      </colgroup>
      <tbody ref="summaryListRef">
        <tr v-for="(skill, index) in favoriteSkills" :key="skill.id" class="summary-row" :data-id="skill.id">
          <td class="td-actions">
            <button class="action-icon" @click.stop="favoritesStore.moveFavorite(skill.id, -1)" :disabled="index === 0" :aria-label="t('ui.moveUp')">
              <ChevronUp :size="16" />
            </button>
            <button class="action-icon" @click.stop="favoritesStore.moveFavorite(skill.id, 1)" :disabled="index === favoriteSkills.length - 1" :aria-label="t('ui.moveDown')">
              <ChevronDown :size="16" />
            </button>
          </td>

          <td class="td-icon">
            <GameIcon :name="skill.name" category="fusion" class="summary-icon" />
          </td>
          <td class="td-text fusion-text">
            <div class="part-title-group">
              <div class="part-name">{{ t(skill.name) }}</div>
            </div>
          </td>

          <td class="td-operator">
            <span class="operator">=</span>
          </td>

          <td class="td-icon tracker-cell" @click="trackerStore.toggleAcquired(skill.mainSkill.name)" :class="{ 'is-acquired': trackerStore.isAcquired(skill.mainSkill.name) }">
            <div class="tracker-icon-wrapper">
              <GameIcon :name="skill.mainSkill.name" category="skill" class="part-icon" />
              <div v-if="trackerStore.isAcquired(skill.mainSkill.name)" class="acquired-badge">
                <CheckCircle2 :size="16" />
              </div>
            </div>
          </td>
          <td class="td-text main-text tracker-cell" @click="trackerStore.toggleAcquired(skill.mainSkill.name)" :class="{ 'is-conflicted': favoritesStore.conflicts.get(skill.id)?.includes(skill.mainSkill.name), 'is-acquired': trackerStore.isAcquired(skill.mainSkill.name) }" :title="favoritesStore.conflicts.get(skill.id)?.includes(skill.mainSkill.name) ? t('ui.card.conflictBadge') : undefined">
            <div class="part-title-group">
              <div class="part-name">{{ t(skill.mainSkill.name) }}</div>
              <span v-if="skill.mainSkill.enchant" class="enchant">({{ t(skill.mainSkill.enchant) }})</span>
            </div>
          </td>

          <td class="td-operator">
            <span class="operator">+</span>
          </td>

          <td class="td-icon tracker-cell" @click="trackerStore.toggleAcquired(skill.subSkill.name)" :class="{ 'is-acquired': trackerStore.isAcquired(skill.subSkill.name) }">
            <div class="tracker-icon-wrapper">
              <GameIcon :name="skill.subSkill.name" category="skill" class="part-icon" />
              <div v-if="trackerStore.isAcquired(skill.subSkill.name)" class="acquired-badge">
                <CheckCircle2 :size="16" />
              </div>
            </div>
          </td>
          <td class="td-text sub-text tracker-cell" @click="trackerStore.toggleAcquired(skill.subSkill.name)" :class="{ 'is-conflicted': favoritesStore.conflicts.get(skill.id)?.includes(skill.subSkill.name), 'is-acquired': trackerStore.isAcquired(skill.subSkill.name) }" :title="favoritesStore.conflicts.get(skill.id)?.includes(skill.subSkill.name) ? t('ui.card.conflictBadge') : undefined">
            <div class="part-title-group">
              <div class="part-name">{{ t(skill.subSkill.name) }}</div>
              <span v-if="skill.subSkill.enchant" class="enchant">({{ t(skill.subSkill.enchant) }})</span>
            </div>
          </td>

          <td class="td-actions">
            <button class="action-icon delete-icon" @click.stop="removeWithUndo(skill)" :aria-label="t('ui.remove')">
              <Trash2 :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.build-summary {
  padding: 0;
  margin-bottom: 20px;
  overflow-x: auto;
}

.summary-table {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border-collapse: collapse;
  table-layout: fixed; /* Ensures column widths are respected */
}

.summary-table col.col-actions { width: 3%; } /* 操作按鈕 */
.summary-table col.col-icon { width: 4%; } /* icon */
.summary-table col.col-fusion-text { width: 7%; }  /* 組合技能 */
.summary-table col.col-operator { width: 4%; }  /* 運算符  */
.summary-table col.col-main-text { width: 7%; }  /* 主技能 */
.summary-table col.col-sub-text { width: 7%; }  /* 副技能 */

.summary-row {
  border-bottom: 1px dashed var(--glass-border);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row td {
  padding: 10px 4px;
  vertical-align: middle;
  height: 100%;
}

.td-actions {
  text-align: center;
  vertical-align: middle;
}

.td-actions .action-icon {
  margin: 0 auto 4px auto;
}

.td-actions .action-icon:last-child {
  margin-bottom: 0;
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

.td-icon {
  text-align: center;
  vertical-align: middle;
  height: 100%;
}

.td-text {
  text-align: center;
  vertical-align: middle;
  height: 100%;
}

.summary-icon, .part-icon {
  --icon-size: var(--icon-size-summary);
}

.part-title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 100%;
}

.fusion-text {
  color: var(--accent-cyan);
  font-weight: 700;
  text-shadow: 0 0 8px var(--accent-cyan-glow);
}

.main-text {
  color: var(--accent-cyan);
}

.sub-text {
  color: var(--accent-purple);
}

.td-text.is-conflicted {
  color: var(--danger);
  text-shadow: 0 0 8px var(--danger-border);
}

.td-operator {
  text-align: center;
}

.operator {
  color: var(--text-muted);
  font-weight: bold;
}

.enchant {
  font-size: 0.75em;
  opacity: 0.85;
}

/* Tracker UI Styles */
.tracker-cell {
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
  user-select: none;
}

.tracker-cell:active {
  transform: scale(0.95);
}

.tracker-icon-wrapper {
  position: relative;
  display: inline-block;
}

.acquired-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  color: var(--success, #10b981);
  background: var(--bg-primary, #1e1e2e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.td-icon.is-acquired .part-icon {
  filter: drop-shadow(0 0 6px var(--success, rgba(16, 185, 129, 0.6)));
}

.td-text.is-acquired {
  color: var(--success, #10b981);
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.td-text.is-acquired .enchant {
  color: var(--text-muted);
}
</style>
