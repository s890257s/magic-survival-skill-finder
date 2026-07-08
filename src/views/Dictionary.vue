<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Sortable from 'sortablejs'
import { Search, Pin, Sparkles } from '@lucide/vue'
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

const pinnedStore = usePinnedStore()
const toastStore = useToastStore()
const favoritesStore = useFavoritesStore()
const dictionaryStore = useDictionaryStore()
const { t } = useI18n()

const filters = dictionaryStore.filters
const { resetAll } = dictionaryStore

const listTop = ref(null)
const scrollToListTop = () => {
  listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onSelectBase = (name) => {
  if (filters.baseSkill !== name) {
    filters.baseSkill = name
    filters.enchant = ''
  }
  scrollToListTop()
}

const onSelectEnchant = ({ baseName, enchantName }) => {
  filters.baseSkill = baseName
  filters.enchant = enchantName
  scrollToListTop()
}

const onSelectSubject = (name) => {
  if (filters.subject !== name) {
    filters.subject = name
  }
  scrollToListTop()
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
    if (filters.search) {
      const q = filters.search.trim().toLowerCase()
      if (q && !skill.searchText.includes(q)) return false
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
    .map(id => filteredSkills.value.find(s => s.id === id))
    .filter(Boolean)
})

const unpinnedSkills = computed(() => {
  return filteredSkills.value.filter((s) => !pinnedStore.isPinned(s.id))
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
const unpinnedCards = ref([])
const isBuildSummaryExpanded = ref(true)

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
        </div>
      </div>
      <hr class="header-divider" />
    </div>
    <div class="list-area" ref="listTop">
      <!-- Section 1: Build Summary -->
      <div class="section-container">
        <div class="section-header">
          <div class="section-title">
            <Sparkles :size="18" class="section-icon" />
            <span>{{ t('ui.builder.summaryTitle') }}</span>
            <span class="count-badge">{{ favoritesStore.favoriteSkills.length }}/{{ favoritesStore.maxSlots }}</span>
          </div>
          <div class="section-actions">
            <button class="btn-text" @click="isBuildSummaryExpanded = !isBuildSummaryExpanded" :disabled="favoritesStore.favoriteSkills.length === 0">
              {{ isBuildSummaryExpanded ? t('ui.dict.collapseAll') : t('ui.dict.expandAll') }}
            </button>
          </div>
        </div>
        
        <div v-if="favoritesStore.favoriteSkills.length === 0" class="section-empty-state">
          {{ t('ui.builder.empty') }}
        </div>
        <div v-show="isBuildSummaryExpanded" v-else>
          <BuildSummary hideHeader />
        </div>
      </div>

      <!-- Section 2: Pinned Skills -->
      <div class="section-container">
        <div class="section-header">
          <div class="section-title">
            <Pin :size="18" class="section-icon" />
            <span>{{ t('ui.dict.pinnedSkills') }}</span>
            <span class="count-badge">{{ pinnedStore.pinnedIds.length }}</span>
          </div>
          <div class="section-actions">
            <button class="btn-text danger" @click="unpinAll" :disabled="pinnedInView.length === 0">
              {{ t('ui.dict.unpinAll') }}
            </button>
            <div class="action-divider"></div>
            <button class="btn-text" @click="toggleExpandAll(pinnedCards, true)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.expandAll') }}</button>
            <button class="btn-text" @click="toggleExpandAll(pinnedCards, false)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.collapseAll') }}</button>
          </div>
        </div>
        
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

    <!-- DictionaryTopBar -->
    <DictionaryTopBar v-model="filters.search" :resultCount="filteredSkills.length" />

    <div class="list-area">
      <!-- Main Content Empty State (Filters) -->
      <EmptyState
        v-if="filteredSkills.length === 0"
        :text="t('ui.dict.noResults')"
        :showAction="hasActiveFilters || filters.search !== ''"
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
          <div class="section-header">
            <div class="section-title">
              <span>{{ t('ui.dict.otherSkills') }}</span>
              <span class="count-badge">{{ unpinnedSkills.length }}</span>
            </div>
            <div class="section-actions">
              <button class="btn-text" @click="toggleExpandAll(unpinnedCards, true)" :disabled="unpinnedSkills.length === 0">{{ t('ui.dict.expandAll') }}</button>
              <button class="btn-text" @click="toggleExpandAll(unpinnedCards, false)" :disabled="unpinnedSkills.length === 0">{{ t('ui.dict.collapseAll') }}</button>
            </div>
          </div>
          
          <div v-if="unpinnedSkills.length > 0" class="skill-list unpinned-list">
            <SkillCard
              v-for="skill in unpinnedSkills"
              :key="skill.id"
              ref="unpinnedCards"
              :data-id="skill.id"
              :skill="skill"
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
</style>
