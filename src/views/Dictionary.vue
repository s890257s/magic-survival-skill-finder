<script setup>
import { ref, computed } from 'vue'
import { Search, Filter, X } from '@lucide/vue'
import { skillsData, schoolOptions, subjectOptions, baseSkillOptions, enchantOptionsFor } from '../data'
import SkillCard from '../components/SkillCard.vue'
import IconSelect from '../components/ui/IconSelect.vue'
import GameIcon from '../components/ui/GameIcon.vue'
import ThemeToggle from '../components/ui/ThemeToggle.vue'
import LangToggle from '../components/ui/LangToggle.vue'

const searchQuery = ref('')
const selectedSchool = ref('')
const selectedSubject = ref('')
const selectedBaseSkill = ref('')
const selectedEnchant = ref('')
const onlyUltimate = ref(false)

const isFilterOpen = ref(true)

const hasActiveFilters = computed(() => {
  return selectedSchool.value || selectedSubject.value || selectedBaseSkill.value || onlyUltimate.value
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
      label: `學派：${selectedSchool.value}`,
      icon: { name: selectedSchool.value, category: 'school' },
      clear: () => (selectedSchool.value = '')
    })
  }
  if (selectedSubject.value) {
    chips.push({
      key: 'subject',
      label: `實驗體：${selectedSubject.value}`,
      icon: { name: selectedSubject.value, category: 'subject' },
      clear: () => (selectedSubject.value = '')
    })
  }
  if (selectedBaseSkill.value) {
    chips.push({
      key: 'base',
      label: `技能：${selectedBaseSkill.value}`,
      icon: { name: selectedBaseSkill.value, category: 'skill' },
      clear: () => {
        selectedBaseSkill.value = ''
        selectedEnchant.value = ''
      }
    })
  }
  if (selectedEnchant.value) {
    chips.push({ key: 'enchant', label: `附魔：${selectedEnchant.value}`, icon: null, clear: () => (selectedEnchant.value = '') })
  }
  if (onlyUltimate.value) {
    chips.push({ key: 'ultimate', label: '僅顯示終極技能', icon: null, clear: () => (onlyUltimate.value = false) })
  }
  return chips
})

// Filtered Skills
const filteredSkills = computed(() => {
  return skillsData.filter(skill => {
    // Keyword match（融合技能名稱或基礎技能名稱）
    if (searchQuery.value) {
      const q = searchQuery.value.trim()
      const qLower = q.toLowerCase()
      const matched =
        skill.name.includes(q) ||
        (skill.enName && skill.enName.toLowerCase().includes(qLower)) ||
        skill.mainSkill?.name.includes(q) ||
        (skill.mainSkill?.enName && skill.mainSkill.enName.toLowerCase().includes(qLower)) ||
        (skill.mainSkill?.enEnchant && skill.mainSkill.enEnchant.toLowerCase().includes(qLower)) ||
        skill.subSkill?.name.includes(q) ||
        (skill.subSkill?.enName && skill.subSkill.enName.toLowerCase().includes(qLower)) ||
        (skill.subSkill?.enEnchant && skill.subSkill.enEnchant.toLowerCase().includes(qLower))
      if (!matched) return false
    }
    // School match：顯示該學派專屬 + 無限制的通用技能
    if (selectedSchool.value && skill.requirements?.school && skill.requirements.school !== selectedSchool.value) {
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
</script>

<template>
  <div class="dictionary-view">
    <header class="header">
      <div class="app-header">
        <h1 class="app-title">
          Magic Survival 魔法生存戰
          <span class="version-tag">v0.991</span>
        </h1>
      </div>
      <div class="search-bar">
        <div class="search-wrapper">
          <Search class="search-icon" :size="20" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜尋融合或基礎技能名稱 (中/英文)..."
            class="search-input"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search" aria-label="清除搜尋">
            <X :size="18" />
          </button>
        </div>
        <button
          class="filter-toggle"
          @click="isFilterOpen = !isFilterOpen"
          :class="{ active: isFilterOpen || hasActiveFilters }"
          aria-label="進階篩選"
        >
          <Filter :size="20" />
          <span v-if="hasActiveFilters" class="filter-dot"></span>
        </button>
        <LangToggle />
        <ThemeToggle />
      </div>

      <div class="filter-panel" :class="{ 'is-open': isFilterOpen }">
        <div class="filter-header">
          <h3>進階篩選</h3>
          <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">清除全部</button>
        </div>
        <div class="filter-grid">
          <IconSelect v-model="selectedSchool" :options="schoolOptions" placeholder="所有學派(目前版本沒有差異)" category="school" disabled />
          <IconSelect v-model="selectedSubject" :options="subjectOptions" placeholder="所有實驗體" category="subject" />
          <IconSelect
            :modelValue="selectedBaseSkill"
            @update:modelValue="onBaseSkillChange"
            :options="baseSkillOptions"
            placeholder="基礎技能"
            category="skill"
          />
          <IconSelect
            v-model="selectedEnchant"
            :options="enchants"
            placeholder="指定附魔"
            :disabled="!selectedBaseSkill || enchants.length === 0"
          />
        </div>
        <div class="filter-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="onlyUltimate" />
            <span class="checkbox-text">僅顯示終極技能</span>
          </label>
        </div>
      </div>

      <div class="result-bar">
        <span class="result-count">符合 {{ filteredSkills.length }} 筆</span>
        <div v-if="activeChips.length > 0" class="chip-list">
          <button
            v-for="chip in activeChips"
            :key="chip.key"
            class="filter-chip"
            @click="chip.clear"
            :aria-label="`移除篩選 ${chip.label}`"
          >
            <GameIcon v-if="chip.icon" :name="chip.icon.name" :category="chip.icon.category" :size="16" />
            {{ chip.label }}
            <X :size="14" />
          </button>
        </div>
      </div>
    </header>

    <div class="skill-list" ref="listTop">
      <div v-if="filteredSkills.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <Search :size="48" />
        </div>
        <p>找不到符合條件的技能</p>
        <button v-if="hasActiveFilters || searchQuery" class="reset-btn" @click="clearFilters(); searchQuery = ''">
          清除搜尋與篩選
        </button>
      </div>
      <SkillCard
        v-for="skill in filteredSkills"
        :key="skill.id"
        :skill="skill"
        clickableBases
        @select-base="onSelectBase"
        @select-enchant="onSelectEnchant"
        @select-subject="onSelectSubject"
      />
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
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
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

.skill-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-margin-top: 96px;
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

.checkbox-label input[type="checkbox"] {
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

.checkbox-label input[type="checkbox"]:checked {
  background: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.checkbox-label input[type="checkbox"]:checked::after {
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
