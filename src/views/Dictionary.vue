<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Sortable from 'sortablejs'
import { Search, Pin } from '@lucide/vue'
import { skillsData } from '@/data'
import SkillCard from '@/components/SkillCard.vue'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useFavoritesStore } from '@/stores/favorites'
import { useDictionaryStore } from '@/stores/dictionary'
import EmptyState from '@/components/ui/EmptyState.vue'
import BuildSummary from '@/components/builder/BuildSummary.vue'
import { useI18n } from '@/composables/useI18n'

import DictionaryHeader from '@/components/dictionary/DictionaryHeader.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'

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

const pinnedListRef = ref(null)
let sortable = null

const initSortable = () => {
  if (pinnedListRef.value && !sortable) {
    sortable = Sortable.create(pinnedListRef.value, {
      handle: '.drag-handle',
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
    <header class="header">
      <DictionaryHeader v-model="filters.search" />
      <DictionaryFilterPanel />
      <DictionaryResultBar :resultCount="filteredSkills.length" />
    </header>

    <div class="list-area" ref="listTop">
      <div class="dictionary-build-summary-wrapper" v-if="favoritesStore.favoriteSkills.length > 0">
        <BuildSummary collapsible />
        <hr class="divider" />
      </div>
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
      <template v-else>
        <div v-if="pinnedInView.length > 0" class="pinned-bar">
          <span class="pinned-info">
            <Pin :size="14" />
            {{ t('ui.dict.pinnedCount', pinnedStore.pinnedIds.length) }}
          </span>
          <button class="btn btn-danger-text unpin-all-btn" @click="unpinAll">{{ t('ui.dict.unpinAll') }}</button>
        </div>
        
        <div v-if="pinnedInView.length > 0" ref="pinnedListRef" class="skill-list pinned-list">
          <SkillCard
            v-for="(skill, index) in pinnedInView"
            :key="skill.id"
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

        <div v-if="pinnedInView.length > 0 && unpinnedSkills.length > 0" class="list-divider">
          <hr class="divider" />
          <span class="divider-text">{{ t('ui.dict.otherSkills') }}</span>
          <hr class="divider" />
        </div>

        <div v-if="unpinnedSkills.length > 0" class="skill-list unpinned-list">
          <SkillCard
            v-for="skill in unpinnedSkills"
            :key="skill.id"
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
      </template>
    </div>
  </div>
</template>

<style scoped>
.dictionary-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--bg-dark);
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  transition: background-color 0.3s ease;
}

.list-area {
  scroll-margin-top: 96px;
}

.dictionary-build-summary-wrapper {
  padding: 16px 16px 0;
}

.dictionary-build-summary-wrapper :deep(.build-summary) {
  margin-bottom: 16px;
}

.pinned-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px 0;
}

.pinned-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--accent-cyan);
  font-weight: 600;
}

.unpin-all-btn {
  font-size: 0.8rem;
}

.skill-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-divider {
  display: flex;
  align-items: center;
  margin: 0 16px;
  gap: 16px;
}

.list-divider .divider {
  flex: 1;
  border: none;
  border-top: 1px dashed var(--glass-border);
  margin: 0;
}

.list-divider .divider-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .skill-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
