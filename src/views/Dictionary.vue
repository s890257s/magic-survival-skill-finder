<script setup>
import { ref, computed } from 'vue'
import { Search, Filter } from '@lucide/vue'
import skillsData from '../data/skills.json'
import SkillCard from '../components/SkillCard.vue'
import FormSelect from '../components/ui/FormSelect.vue'

const searchQuery = ref('')
const selectedSchool = ref('')
const selectedSubject = ref('')
const selectedBaseSkill = ref('')
const selectedEnchant = ref('')

const isFilterOpen = ref(false)

const hasActiveFilters = computed(() => {
  return selectedSchool.value || selectedSubject.value || selectedBaseSkill.value
})

// Extract unique values
const uniqueOptions = (extractFn) => {
  const set = new Set()
  skillsData.forEach(skill => {
    const val = extractFn(skill)
    if (val) set.add(val)
  })
  return Array.from(set).sort().map(v => ({ value: v, label: v }))
}

const schools = computed(() => uniqueOptions(s => s.requirements?.school))
const subjects = computed(() => uniqueOptions(s => s.requirements?.subject))
const baseSkills = computed(() => {
  const set = new Set()
  skillsData.forEach(s => {
    if (s.mainSkill?.name) set.add(s.mainSkill.name)
    if (s.subSkill?.name) set.add(s.subSkill.name)
  })
  return Array.from(set).sort().map(v => ({ value: v, label: v }))
})

// Dynamic enchants based on selectedBaseSkill
const enchants = computed(() => {
  if (!selectedBaseSkill.value) return []
  const set = new Set()
  skillsData.forEach(s => {
    if (s.mainSkill?.name === selectedBaseSkill.value && s.mainSkill?.enchant) {
      set.add(s.mainSkill.enchant)
    }
    if (s.subSkill?.name === selectedBaseSkill.value && s.subSkill?.enchant) {
      set.add(s.subSkill.enchant)
    }
  })
  return Array.from(set).sort().map(v => ({ value: v, label: v }))
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
}

// Filtered Skills
const filteredSkills = computed(() => {
  return skillsData.filter(skill => {
    // Keyword match
    if (searchQuery.value && !skill.name.includes(searchQuery.value)) {
      return false
    }
    // School match
    if (selectedSchool.value && skill.requirements?.school !== selectedSchool.value) {
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
    return true
  })
})
</script>

<template>
  <div class="dictionary-view">
    <header class="header">
      <div class="search-bar">
        <Search class="search-icon" :size="20" />
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜尋融合技能名稱..." 
          class="search-input"
        />
        <button 
          class="filter-toggle" 
          @click="isFilterOpen = !isFilterOpen" 
          :class="{ active: isFilterOpen || hasActiveFilters }"
        >
          <Filter :size="20" />
          <span v-if="hasActiveFilters" class="filter-dot"></span>
        </button>
      </div>

      <div class="filter-panel" :class="{ 'is-open': isFilterOpen }">
        <div class="filter-header">
          <h3>進階篩選</h3>
          <button v-if="hasActiveFilters" @click="clearFilters" class="clear-btn">清除全部</button>
        </div>
        <div class="filter-grid">
          <FormSelect v-model="selectedSchool" :options="schools" placeholder="所有學派" />
          <FormSelect v-model="selectedSubject" :options="subjects" placeholder="所有實驗體" />
          <FormSelect 
            :modelValue="selectedBaseSkill" 
            @update:modelValue="onBaseSkillChange" 
            :options="baseSkills" 
            placeholder="基礎技能" 
          />
          <FormSelect 
            v-model="selectedEnchant" 
            :options="enchants" 
            placeholder="指定附魔" 
            :disabled="!selectedBaseSkill || enchants.length === 0" 
          />
        </div>
      </div>
    </header>

    <div class="skill-list">
      <div v-if="filteredSkills.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <Search :size="48" />
        </div>
        <p>找不到符合條件的技能</p>
      </div>
      <SkillCard 
        v-for="skill in filteredSkills" 
        :key="skill.id" 
        :skill="skill" 
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
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px 12px 48px;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.2);
}

.filter-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
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
  background: rgba(0, 240, 255, 0.1);
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
  background: rgba(181, 55, 242, 0.1);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skill-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

@media (min-width: 768px) {
  .skill-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}
</style>
