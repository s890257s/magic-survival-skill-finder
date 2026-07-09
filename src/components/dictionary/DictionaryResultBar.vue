<script setup>
import { computed } from 'vue'
import { X } from '@lucide/vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useDictionaryStore } from '@/stores/dictionary'

const props = defineProps({
  resultCount: {
    type: Number,
    required: true
  },
  hideSearchChips: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const filters = dictionaryStore.filters

const CHIP_DEFS = [
  { key: 'school', i18nKey: 'ui.chip.school', category: 'school' },
  { key: 'subject', i18nKey: 'ui.chip.subject', category: 'subject' },
  { key: 'baseSkill', i18nKey: 'ui.chip.base', category: 'skill' },
  { key: 'enchant', i18nKey: 'ui.chip.enchant', category: null },
]

const activeChips = computed(() => {
  const chips = []
  
  if (!props.hideSearchChips) {
    if (filters.search.trim()) {
      chips.push({ key: 'search_input', label: filters.search.trim(), isSearch: true, icon: null })
    }
    // tag 內容不可重複（DictionaryHeader.addTag 已擋），可直接當 key
    filters.searchTags.forEach((tag, idx) => {
      chips.push({ key: `search_tag_${tag}`, label: tag, isSearchTag: true, tagIndex: idx, icon: null })
    })
  }

  CHIP_DEFS.filter((def) => filters[def.key]).forEach((def) => {
    chips.push({
      key: def.key,
      label: t(def.i18nKey, t(filters[def.key])),
      icon: def.category ? { name: filters[def.key], category: def.category } : null,
    })
  })
  
  if (filters.ultimate) {
    chips.push({ key: 'ultimate', label: t('ui.dict.onlyUltimate'), icon: null })
  }
  if (filters.excludeConsumed) {
    chips.push({ key: 'excludeConsumed', label: t('ui.dict.excludeConsumed'), icon: null })
  }
  return chips
})

const removeFilter = (chip) => {
  if (chip.isSearch) {
    filters.search = ''
  } else if (chip.isSearchTag) {
    filters.searchTags.splice(chip.tagIndex, 1)
  } else if (chip.key === 'baseSkill') {
    filters.baseSkill = ''
    filters.enchant = ''
  } else {
    filters[chip.key] = typeof filters[chip.key] === 'boolean' ? false : ''
  }
}
</script>

<template>
  <div class="result-bar">
    <span class="result-count">{{ t('ui.dict.resultCount', resultCount) }}</span>
    <div v-if="activeChips.length > 0" class="chip-list">
      <button
        v-for="chip in activeChips"
        :key="chip.key"
        class="filter-chip"
        @click="removeFilter(chip)"
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
</template>

<style scoped>
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
  border-bottom: none; /* Reset if previously cascaded */
}

.filter-chip:hover {
  background: var(--accent-cyan-bg-strong);
}
</style>
