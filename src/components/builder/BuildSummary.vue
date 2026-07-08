<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { Sparkles, Trash2, ChevronUp, ChevronDown } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import GameIcon from '@/components/ui/GameIcon.vue'

const props = defineProps({
  collapsible: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const isCollapsed = ref(false)

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()
const { t } = useI18n()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)

const removeWithUndo = (skill) => {
  const backup = [...favoritesStore.favoriteIds]
  favoritesStore.toggleFavorite(skill.id)
  toastStore.showUndoToast(t('ui.card.removed', t(skill.name)), t('ui.restore'), () =>
    favoritesStore.setFavorites(backup),
  )
}

const summaryListRef = ref(null)
let summarySortable = null

const initSortable = () => {
  if (summaryListRef.value && !summarySortable) {
    summarySortable = Sortable.create(summaryListRef.value, {
      delay: 250,
      delayOnTouchOnly: true,
      filter: '.summary-actions',
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
  if (!isCollapsed.value) {
    await nextTick()
    initSortable()
  }
})

watch(isCollapsed, async (newVal) => {
  if (!newVal) {
    await nextTick()
    initSortable()
  } else {
    if (summarySortable) {
      summarySortable.destroy()
      summarySortable = null
    }
  }
})

onMounted(() => {
  if (!isCollapsed.value) {
    initSortable()
  }
})

onBeforeUnmount(() => {
  if (summarySortable) summarySortable.destroy()
})
</script>

<template>
  <div class="build-summary glass-panel" v-if="favoriteSkills.length > 0">
    <div class="summary-header" v-if="!hideHeader" @click="collapsible && (isCollapsed = !isCollapsed)" :class="{ clickable: collapsible }">
      <h3 class="summary-title"><Sparkles :size="18" /> {{ t('ui.builder.summaryTitle') }} <span class="count" v-if="collapsible">({{ favoriteSkills.length }}/{{ favoritesStore.maxSlots }})</span></h3>
      <div v-if="collapsible" class="collapse-icon">
        <ChevronDown v-if="isCollapsed" :size="20" />
        <ChevronUp v-else :size="20" />
      </div>
    </div>
    
    <table v-if="!isCollapsed" class="summary-table">
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
            <button class="action-icon" @click.stop="favoritesStore.moveFavorite(skill.id, -1)" :disabled="index === 0" aria-label="上移">
              <ChevronUp :size="16" />
            </button>
            <button class="action-icon" @click.stop="favoritesStore.moveFavorite(skill.id, 1)" :disabled="index === favoriteSkills.length - 1" aria-label="下移">
              <ChevronDown :size="16" />
            </button>
          </td>
          
          <td class="td-icon">
            <GameIcon :name="skill.name" category="fusion" :size="28" class="summary-icon" />
          </td>
          <td class="td-text fusion-text">
            <div class="part-title-group">
              <div class="part-name">{{ t(skill.name) }}</div>
            </div>
          </td>

          <td class="td-operator">
            <span class="operator">=</span>
          </td>

          <td class="td-icon">
            <GameIcon :name="skill.mainSkill.name" category="skill" :size="28" class="part-icon" />
          </td>
          <td class="td-text main-text">
            <div class="part-title-group">
              <div class="part-name">{{ t(skill.mainSkill.name) }}</div>
              <span v-if="skill.mainSkill.enchant" class="enchant">({{ t(skill.mainSkill.enchant) }})</span>
            </div>
          </td>

          <td class="td-operator">
            <span class="operator">+</span>
          </td>

          <td class="td-icon">
            <GameIcon :name="skill.subSkill.name" category="skill" :size="28" class="part-icon" />
          </td>
          <td class="td-text sub-text">
            <div class="part-title-group">
              <div class="part-name">{{ t(skill.subSkill.name) }}</div>
              <span v-if="skill.subSkill.enchant" class="enchant">({{ t(skill.subSkill.enchant) }})</span>
            </div>
          </td>

          <td class="td-actions">
            <button class="action-icon delete-icon" @click.stop="removeWithUndo(skill)" aria-label="移除">
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

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-header.clickable {
  cursor: pointer;
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-cyan);
  margin-bottom: 0;
  font-size: 1.1rem;
}

.summary-title .count {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.collapse-icon {
  color: var(--text-muted);
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
</style>
