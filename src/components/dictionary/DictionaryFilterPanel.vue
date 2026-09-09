<script setup>
import { computed } from 'vue'
import {
  schoolOptions,
  subjectOptions,
  baseSkillOptions,
  enchantOptionsFor,
} from '@/data'
import IconSelect from '@/components/ui/IconSelect.vue'
import { useI18n } from '@/composables/useI18n'
import { useDictionaryStore } from '@/stores/dictionary'

const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const filters = dictionaryStore.filters

const enchants = computed(() => {
  if (!filters.baseSkill) return []
  return enchantOptionsFor(filters.baseSkill)
})

const onBaseSkillChange = (val) => {
  filters.baseSkill = val
  filters.enchant = ''
}
</script>

<template>
  <div class="filter-panel glass-panel">
    <div class="filter-content">
      <div class="filter-grid">
        <!-- 學派篩選：等待遊戲學派資料補齊，暫時停用；資料到位後移除 disabled 即可 -->
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
          <input type="checkbox" v-model="filters.onlyNew" />
          <span class="checkbox-text">{{ t('ui.dict.onlyNew') }}</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="filters.excludeConsumed" />
          <span class="checkbox-text">{{ t('ui.dict.excludeConsumed') }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-panel {
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
}

.filter-content {
  margin-top: 16px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 576px) {
  .filter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.filter-options {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
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
  transition: background 0.2s ease, border-color 0.2s ease;
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
