<script setup>
import { ref, computed, watch } from 'vue'
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
import IconSelect from '@/components/ui/IconSelect.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import { useI18n } from '@/composables/useI18n'

const pinnedStore = usePinnedStore()
const toastStore = useToastStore()
const { t } = useI18n()

const searchQuery = ref('')
const selectedSchool = ref('')
const selectedSubject = ref('')
const selectedBaseSkill = ref('')
const selectedEnchant = ref('')
const onlyUltimate = ref(false)

// 記住上次的展開狀態，首次進入預設收合
const FILTER_PANEL_KEY = 'filter_panel_open'
const isFilterOpen = ref(localStorage.getItem(FILTER_PANEL_KEY) === 'true')
watch(isFilterOpen, (val) => localStorage.setItem(FILTER_PANEL_KEY, val))

const hasActiveFilters = computed(() => {
  return (
    selectedSchool.value || selectedSubject.value || selectedBaseSkill.value || onlyUltimate.value
  )
})

// Dynamic enchants based on selectedBaseSkill
const enchants = computed(() => {
  if (!selectedBaseSkill.value) return []
  return enchantOptionsFor(selectedBaseSkill.value)
})

// Reset enchant when base skill changes
const onBaseSkillChange = (val) => {
  selectedBaseSkill.value = val
  selectedEnchant.value = ''
}

const clearFilters = () => {
  selectedSchool.value = ''
  selectedSubject.value = ''
  selectedBaseSkill.value = ''
  selectedEnchant.value = ''
  onlyUltimate.value = false
}

const resetAll = () => {
  clearFilters()
  searchQuery.value = ''
}

// 卡片上點擊基礎技能名稱 → 直接反查
const listTop = ref(null)

const onSelectBase = (name) => {
  if (selectedBaseSkill.value !== name) {
    selectedBaseSkill.value = name
    selectedEnchant.value = ''
  }
  listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onSelectEnchant = ({ baseName, enchantName }) => {
  selectedBaseSkill.value = baseName
  selectedEnchant.value = enchantName
  listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const onSelectSubject = (name) => {
  if (selectedSubject.value !== name) {
    selectedSubject.value = name
  }
  listTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 目前套用中的篩選 chips
const activeChips = computed(() => {
  const chips = []
  if (selectedSchool.value) {
    chips.push({
      key: 'school',
      label: t('ui.chip.school').replace('{0}', t(selectedSchool.value)),
      icon: { name: selectedSchool.value, category: 'school' },
      clear: () => (selectedSchool.value = ''),
    })
  }
  if (selectedSubject.value) {
    chips.push({
      key: 'subject',
      label: t('ui.chip.subject').replace('{0}', t(selectedSubject.value)),
      icon: { name: selectedSubject.value, category: 'subject' },
      clear: () => (selectedSubject.value = ''),
    })
  }
  if (selectedBaseSkill.value) {
    chips.push({
      key: 'base',
      label: t('ui.chip.base').replace('{0}', t(selectedBaseSkill.value)),
      icon: { name: selectedBaseSkill.value, category: 'skill' },
      clear: () => {
        selectedBaseSkill.value = ''
        selectedEnchant.value = ''
      },
    })
  }
  if (selectedEnchant.value) {
    chips.push({
      key: 'enchant',
      label: t('ui.chip.enchant').replace('{0}', t(selectedEnchant.value)),
      icon: null,
      clear: () => (selectedEnchant.value = ''),
    })
  }
  if (onlyUltimate.value) {
    chips.push({
      key: 'ultimate',
      label: t('ui.dict.onlyUltimate'),
      icon: null,
      clear: () => (onlyUltimate.value = false),
    })
  }
  return chips
})

// Filtered Skills
const filteredSkills = computed(() => {
  return skillsData.filter((skill) => {
    // Keyword match（融合技能名稱或基礎技能名稱，中英文；searchText 於 data 層預組）
    if (searchQuery.value) {
      const q = searchQuery.value.trim().toLowerCase()
      if (q && !skill.searchText.includes(q)) return false
    }
    // School match：顯示該學派專屬 + 無限制的通用技能
    if (
      selectedSchool.value &&
      skill.requirements?.school &&
      skill.requirements.school !== selectedSchool.value
    ) {
      return false
    }
    // Subject match
    if (selectedSubject.value && skill.requirements?.subject !== selectedSubject.value) {
      return false
    }
    // Base skill match
    if (selectedBaseSkill.value) {
      const matchMain = skill.mainSkill?.name === selectedBaseSkill.value
      const matchSub = skill.subSkill?.name === selectedBaseSkill.value
      if (!matchMain && !matchSub) return false

      // Enchant match
      if (selectedEnchant.value) {
        let enchantMatched = false
        if (matchMain && skill.mainSkill?.enchant === selectedEnchant.value) enchantMatched = true
        if (matchSub && skill.subSkill?.enchant === selectedEnchant.value) enchantMatched = true
        if (!enchantMatched) return false
      }
    }
    // Ultimate match
    if (onlyUltimate.value && !skill.requirements?.ultimate) {
      return false
    }
    return true
  })
})

// 篩選結果中的頂置技能，依 pinnedIds 的順序排列（可由使用者調整）
const pinnedInView = computed(() => {
  const byId = new Map(filteredSkills.value.map((s) => [s.id, s]))
  return pinnedStore.pinnedIds.map((id) => byId.get(id)).filter(Boolean)
})

// 頂置的浮到最上方（只影響排序，仍遵循篩選條件）
const displaySkills = computed(() => {
  if (pinnedInView.value.length === 0) return filteredSkills.value
  const rest = filteredSkills.value.filter((s) => !pinnedStore.isPinned(s.id))
  return [...pinnedInView.value, ...rest]
})

// 調整頂置順序：與「畫面上可見的鄰居」交換，篩選中被隱藏的頂置卡不參與
const onMovePinned = (skill, delta) => {
  const visible = pinnedInView.value
  const index = visible.findIndex((s) => s.id === skill.id)
  const target = visible[index + delta]
  if (!target) return
  pinnedStore.swapPins(skill.id, target.id)
}

// 解除全部頂置：直接執行，靠 toast 的「復原」防誤觸
const unpinAll = () => {
  const backup = [...pinnedStore.pinnedIds]
  pinnedStore.clearPins()
  toastStore.showToast(t('ui.dict.unpinnedAllMsg'), 'info', {
    duration: 6000,
    actionLabel: t('ui.restore'),
    onAction: () => pinnedStore.setPins(backup),
  })
}
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
            v-model="searchQuery"
            :placeholder="t('ui.dict.searchPlaceholder')"
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search"
            :aria-label="t('ui.dict.clearSearch')"
          >
            <X :size="18" />
          </button>
        </div>
        <button
          class="filter-toggle"
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
          <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">{{ t('ui.clearAll') }}</button>
        </div>
        <div class="filter-grid">
          <IconSelect
            v-model="selectedSchool"
            :options="schoolOptions"
            :placeholder="t('ui.dict.schoolAll')"
            category="school"
            disabled
          />
          <IconSelect
            v-model="selectedSubject"
            :options="subjectOptions"
            :placeholder="t('ui.dict.subjectAll')"
            category="subject"
          />
          <IconSelect
            :modelValue="selectedBaseSkill"
            @update:modelValue="onBaseSkillChange"
            :options="baseSkillOptions"
            :placeholder="t('ui.dict.baseSkill')"
            category="skill"
          />
          <IconSelect
            v-model="selectedEnchant"
            :options="enchants"
            :placeholder="t('ui.dict.enchant')"
            :disabled="!selectedBaseSkill || enchants.length === 0"
          />
        </div>
        <div class="filter-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="onlyUltimate" />
            <span class="checkbox-text">{{ t('ui.dict.onlyUltimate') }}</span>
          </label>
        </div>
      </div>

      <div class="result-bar">
        <span class="result-count">{{ t('ui.dict.resultCount').replace('{0}', filteredSkills.length) }}</span>
        <div v-if="activeChips.length > 0" class="chip-list">
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            class="filter-chip"
            @click="chip.clear"
            :aria-label="t('ui.dict.removeFilter').replace('{0}', chip.label)"
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
      <div v-if="filteredSkills.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <Search :size="48" />
        </div>
        <p>{{ t('ui.dict.noResults') }}</p>
        <button v-if="hasActiveFilters || searchQuery" class="reset-btn" @click="resetAll">
          {{ t('ui.resetSearchAndFilter') }}
        </button>
      </div>
      <template v-else>
        <div v-if="pinnedInView.length > 0" class="pinned-bar">
          <span class="pinned-info">
            <Pin :size="14" />
            {{ t('ui.dict.pinnedCount').replace('{0}', pinnedStore.pinnedIds.length) }}
          </span>
          <button class="unpin-all-btn" @click="unpinAll">{{ t('ui.dict.unpinAll') }}</button>
        </div>
        <TransitionGroup tag="div" name="card-move" class="skill-list">
          <SkillCard
            v-for="(skill, index) in displaySkills"
            :key="skill.id"
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
        </TransitionGroup>
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
  z-index: 100;
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
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: var(--text-primary);
  background: var(--glass-border);
}

.search-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}

.filter-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
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
  background: none;
  border: none;
  color: var(--accent-purple);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
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
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.unpin-all-btn:hover {
  color: var(--danger);
  background: var(--danger-bg);
}

.skill-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 頂置/取消頂置時卡片平滑移動（FLIP） */
.card-move-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 搜尋/篩選屬大量增刪，離場即時移除（覆蓋 .skill-card 的 transition: all，
   否則 Vue 會等它跑完才移除節點，造成殘影） */
.card-move-leave-active {
  transition: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  gap: 16px;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
}

.reset-btn {
  padding: 10px 24px;
  background: var(--accent-cyan-bg);
  color: var(--accent-cyan);
  border: 1px solid var(--accent-cyan-border);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reset-btn:hover {
  background: var(--accent-cyan-bg-strong);
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
