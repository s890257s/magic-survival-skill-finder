<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { Sparkles, Trash2, ChevronUp, ChevronDown } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  collapsible: {
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
    <div class="summary-header" @click="collapsible && (isCollapsed = !isCollapsed)" :class="{ clickable: collapsible }">
      <h3 class="summary-title"><Sparkles :size="18" /> {{ t('ui.builder.summaryTitle') }} <span class="count" v-if="collapsible">({{ favoriteSkills.length }}/{{ favoritesStore.maxSlots }})</span></h3>
      <div v-if="collapsible" class="collapse-icon">
        <ChevronDown v-if="isCollapsed" :size="20" />
        <ChevronUp v-else :size="20" />
      </div>
    </div>
    
    <div v-if="!isCollapsed" class="summary-list" ref="summaryListRef">
      <div v-for="(skill, index) in favoriteSkills" :key="'summary-' + skill.id" :data-id="skill.id" class="summary-item" :class="{ 'last-item': index === favoriteSkills.length - 1 }">
        <span class="summary-actions">
          <button class="action-icon" :disabled="index === 0" @click.stop="favoritesStore.moveFavorite(skill.id, -1)" aria-label="上移">
            <ChevronUp :size="16" />
          </button>
          <button class="action-icon" :disabled="index === favoriteSkills.length - 1" @click.stop="favoritesStore.moveFavorite(skill.id, 1)" aria-label="下移">
            <ChevronDown :size="16" />
          </button>
        </span>
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
        <span class="summary-actions">
          <button class="action-icon delete-icon" @click.stop="removeWithUndo(skill)" aria-label="移除">
            <Trash2 :size="16" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.build-summary {
  padding: 16px;
  border-radius: 12px;
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

.summary-list {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto 1fr auto;
  align-items: center;
  column-gap: 8px;
  margin-top: 16px;
}

.summary-item {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  user-select: none;
}

.summary-item > span {
  padding: 10px 0;
  border-bottom: 1px dashed var(--glass-border);
}

.summary-item.last-item > span {
  border-bottom: none;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.summary-actions:last-child {
  flex-direction: row;
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

.skill-name {
  color: var(--accent-cyan);
  font-weight: 700;
  text-shadow: 0 0 8px var(--accent-cyan-glow);
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.operator {
  color: var(--text-muted);
  font-weight: bold;
  text-align: center;
  padding: 10px 4px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-part {
  display: flex;
  flex-direction: column;
  justify-content: center;
  line-height: 1.2;
}

.main-skill {
  color: var(--accent-cyan);
  align-items: center;
}

.sub-skill {
  color: var(--accent-purple);
  align-items: flex-start;
}

.enchant {
  font-size: 0.75em;
  opacity: 0.85;
  margin-top: 2px;
}
</style>
