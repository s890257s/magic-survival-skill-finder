<script setup>
import { computed, ref } from 'vue'
import { Trash2, ChevronUp, ChevronDown } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useTrackerStore } from '@/stores/tracker'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { useSortableList } from '@/composables/useSortableList'
import { useBuildSnapshot } from '@/composables/useBuildSnapshot'
import GameIcon from '@/components/ui/GameIcon.vue'
import SkillPartCells from '@/components/builder/SkillPartCells.vue'

const favoritesStore = useFavoritesStore()
const trackerStore = useTrackerStore()
const toastStore = useToastStore()
const buildSnapshot = useBuildSnapshot()
const { t } = useI18n()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)

const removeWithUndo = (skill) => {
  const backup = buildSnapshot.capture()

  favoritesStore.toggleFavorite(skill.id)

  // 移除後若該基礎技能已沒有其他配方使用，同步取消打勾狀態
  const bases = [skill.mainSkill?.name, skill.subSkill?.name].filter(Boolean)
  bases.forEach((base) => {
    if (!favoritesStore.favoriteBaseUsage.has(base)) {
      trackerStore.removeAcquired(base)
    }
  })

  toastStore.showUndoToast(t('ui.card.removed', t(skill.name)), () =>
    buildSnapshot.restore(backup),
  )
}

const summaryListRef = ref(null)
useSortableList(
  summaryListRef,
  (oldIndex, newIndex) => {
    favoritesStore.reorderFavorites(
      favoriteSkills.value.map((s) => s.id),
      oldIndex,
      newIndex,
    )
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

          <SkillPartCells
            :part="skill.mainSkill"
            :conflicted="!!favoritesStore.conflicts.get(skill.id)?.includes(skill.mainSkill.name)"
            textClass="main-text"
          />

          <td class="td-operator">
            <span class="operator">+</span>
          </td>

          <SkillPartCells
            :part="skill.subSkill"
            :conflicted="!!favoritesStore.conflicts.get(skill.id)?.includes(skill.subSkill.name)"
            textClass="sub-text"
          />

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
  /* fixed：欄寬以 colgroup 為準，不隨內容撐開 */
  table-layout: fixed;
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
  transition: background 0.2s ease, color 0.2s ease;
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

.summary-icon {
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

.td-operator {
  text-align: center;
}

.operator {
  color: var(--text-muted);
  font-weight: bold;
}
</style>
