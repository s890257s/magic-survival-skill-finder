<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import Sortable from 'sortablejs'
import { Search, Filter, X, Pin } from '@lucide/vue'
import {
  skillsData,
  schoolOptions,
  subjectOptions,
  baseSkillOptions,
  enchantOptionsFor,
} from '@/data'
import { gameVersion } from '@/data/meta'
import SkillCard from '@/components/SkillCard.vue'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useFavoritesStore } from '@/stores/favorites'
import { useDictionaryStore } from '@/stores/dictionary'
import IconSelect from '@/components/ui/IconSelect.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useI18n } from '@/composables/useI18n'
import { usePersistedRef } from '@/composables/usePersistedRef'

const pinnedStore = usePinnedStore()
const toastStore = useToastStore()
const favoritesStore = useFavoritesStore()
const dictionaryStore = useDictionaryStore()
const { t } = useI18n()

const filters = dictionaryStore.filters
const { clearFilters, resetAll } = dictionaryStore

const isFilterOpen = usePersistedRef('filter_panel_open', false)

const hasActiveFilters = computed(() => {
  return Boolean(filters.school || filters.subject || filters.baseSkill || filters.ultimate || filters.excludeConsumed)
})

const enchants = computed(() => {
  if (!filters.baseSkill) return []
  return enchantOptionsFor(filters.baseSkill)
})

const onBaseSkillChange = (val) => {
  filters.baseSkill = val
  filters.enchant = ''
}

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

// 篩選 chips 設定表：key 對應 filters 欄位，category 為 GameIcon 分類（null 表示無圖示）
const CHIP_DEFS = [
  { key: 'school', i18nKey: 'ui.chip.school', category: 'school' },
  { key: 'subject', i18nKey: 'ui.chip.subject', category: 'subject' },
  { key: 'baseSkill', i18nKey: 'ui.chip.base', category: 'skill' },
  { key: 'enchant', i18nKey: 'ui.chip.enchant', category: null },
]

const activeChips = computed(() => {
  const chips = CHIP_DEFS.filter((def) => filters[def.key]).map((def) => ({
    key: def.key,
    label: t(def.i18nKey, t(filters[def.key])),
    icon: def.category ? { name: filters[def.key], category: def.category } : null,
  }))
  if (filters.ultimate) {
    chips.push({ key: 'ultimate', label: t('ui.dict.onlyUltimate'), icon: null })
  }
  if (filters.excludeConsumed) {
    chips.push({ key: 'excludeConsumed', label: t('ui.dict.excludeConsumed'), icon: null })
  }
  return chips
})

const removeFilter = (key) => {
  if (key === 'baseSkill') {
    filters.baseSkill = ''
    filters.enchant = ''
  } else {
    filters[key] = typeof filters[key] === 'boolean' ? false : ''
  }
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
    // 學派篩選（暫時停用，見下方 IconSelect 的說明）：無學派需求的技能一律通過
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

const pinnedInView = computed(() => {
  // Directly map and filter instead of creating a new Map for small datasets
  return pinnedStore.pinnedIds
    .map(id => filteredSkills.value.find(s => s.id === id))
    .filter(Boolean)
})

const displaySkills = computed(() => {
  if (pinnedInView.value.length === 0) return filteredSkills.value
  const rest = filteredSkills.value.filter((s) => !pinnedStore.isPinned(s.id))
  return [...pinnedInView.value, ...rest]
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

const skillListRef = ref(null)
let sortable = null

const initSortable = () => {
  if (skillListRef.value && !sortable) {
    sortable = Sortable.create(skillListRef.value, {
      handle: '.drag-handle',
      animation: 150,
      onMove: (evt) => {
        // 只允許在帶有 drag-handle 的卡片(頂置區)內互換位置
        const relatedItem = evt.related
        return relatedItem && relatedItem.querySelector('.drag-handle') !== null
      },
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

  let targetIndex = newIndex
  if (targetIndex >= pinnedInView.value.length) {
    targetIndex = pinnedInView.value.length - 1
  }

  const visible = pinnedInView.value
  const skillId = visible[oldIndex]?.id
  if (!skillId) return

  const visibleIds = visible.map(s => s.id)
  const moved = visibleIds.splice(oldIndex, 1)[0]
  visibleIds.splice(targetIndex, 0, moved)
  
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

watch(() => displaySkills.value.length, async () => {
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
      <div class="app-header">
        <h1 class="app-title">
          {{ t('ui.magicSurvival') }}
          <span class="version-tag">v{{ gameVersion }}</span>
        </h1>
      </div>
      <div class="search-bar">
        <div class="search-wrapper">
          <Search class="search-icon" :size="20" />
          <input
            type="text"
            v-model="filters.search"
            :placeholder="t('ui.dict.searchPlaceholder')"
            class="search-input"
          />
          <button
            v-if="filters.search"
            @click="filters.search = ''"
            class="btn btn-icon-rounded clear-search"
            :aria-label="t('ui.dict.clearSearch')"
          >
            <X :size="18" />
          </button>
        </div>
        <button
          class="btn btn-icon filter-toggle"
          @click="isFilterOpen = !isFilterOpen"
          :class="{ active: isFilterOpen || hasActiveFilters }"
          :aria-label="t('ui.dict.advancedFilter')"
          :aria-expanded="isFilterOpen"
        >
          <Filter :size="20" />
          <span v-if="hasActiveFilters" class="filter-dot"></span>
        </button>
        <HeaderActions />
      </div>

      <div class="filter-panel" :class="{ 'is-open': isFilterOpen }">
        <div class="filter-header">
          <h3>{{ t('ui.dict.advancedFilter') }}</h3>
          <button v-if="hasActiveFilters" @click="clearFilters" class="btn btn-text clear-btn">{{ t('ui.clearAll') }}</button>
        </div>
        <div class="filter-grid">
          <!-- 學派篩選：等待遊戲學派資料補齊，暫時停用；資料到位後移除 disabled 即可
               （filteredSkills、activeChips、clearFilters 的 school 邏輯都已就緒） -->
          <IconSelect
            v-model="filters.school"
            :options="schoolOptions"
            :placeholder="t('ui.dict.schoolAll')"
            category="school"
            disabled
          />
          <IconSelect
            v-model="filters.subject"
            :options="subjectOptions"
            :placeholder="t('ui.dict.subjectAll')"
            category="subject"
          />
          <IconSelect
            :modelValue="filters.baseSkill"
            @update:modelValue="onBaseSkillChange"
            :options="baseSkillOptions"
            :placeholder="t('ui.dict.baseSkill')"
            category="skill"
          />
          <IconSelect
            v-model="filters.enchant"
            :options="enchants"
            :placeholder="t('ui.dict.enchant')"
            :disabled="!filters.baseSkill || enchants.length === 0"
          />
        </div>
        <div class="filter-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="filters.ultimate" />
            <span class="checkbox-text">{{ t('ui.dict.onlyUltimate') }}</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="filters.excludeConsumed" />
            <span class="checkbox-text">{{ t('ui.dict.excludeConsumed') }}</span>
          </label>
        </div>
      </div>

      <div class="result-bar">
        <span class="result-count">{{ t('ui.dict.resultCount', filteredSkills.length) }}</span>
        <div v-if="activeChips.length > 0" class="chip-list">
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            class="filter-chip"
            @click="removeFilter(chip.key)"
            :aria-label="t('ui.dict.removeFilter', chip.label)"
          >
            <GameIcon
              v-if="chip.icon"
              :name="chip.icon.name"
              :category="chip.icon.category"
              :size="16"
            />
            {{ chip.label }}
            <X :size="14" />
          </button>
        </div>
      </div>
    </header>

    <div class="list-area" ref="listTop">
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
        <div ref="skillListRef" class="skill-list">
          <SkillCard
            v-for="(skill, index) in displaySkills"
            :key="skill.id"
            :data-id="skill.id"
            :skill="skill"
            clickableBases
            pinnable
            :reorderable="index < pinnedInView.length && pinnedInView.length > 1"
            :isFirst="index === 0"
            :isLast="index === pinnedInView.length - 1"
            @move="(delta) => onMovePinned(skill, delta)"
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

.app-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
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

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-wrapper {
  flex: 1;
  display: flex;
  position: relative;
  align-items: center;
  min-width: 0;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 40px 12px 48px;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.clear-search {
  position: absolute;
  right: 12px;
}

.search-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}

.filter-toggle {
  position: relative;
  width: 48px;
  height: 48px;
}

.filter-toggle.active {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
}

.filter-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 8px var(--accent-cyan);
}

.filter-panel {
  max-height: 0;
  overflow: hidden;
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  opacity: 0;
}

.filter-panel.is-open {
  max-height: 400px;
  opacity: 1;
  margin-top: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-header h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin: 0;
}

.clear-btn {
  font-size: 0.85rem;
  color: var(--accent-purple);
}

.clear-btn:hover {
  background: var(--accent-purple-bg);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.result-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.result-count {
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.chip-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  color: var(--accent-cyan);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.filter-chip:hover {
  background: var(--accent-cyan-bg-strong);
}

.list-area {
  scroll-margin-top: 96px;
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

@media (min-width: 768px) {
  .skill-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

.filter-options {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap:20px
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.checkbox-label input[type='checkbox'] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--glass-border);
  border-radius: 4px;
  background: var(--bg-surface);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  margin: 0;
}

.checkbox-label input[type='checkbox']:checked {
  background: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.checkbox-label input[type='checkbox']:checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 5px;
  height: 9px;
  border: solid var(--bg-dark);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-weight: 500;
}
</style>
