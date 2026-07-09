<script setup>
import { computed } from 'vue'
import { Search, ChevronUp, ChevronDown } from '@lucide/vue'
import DictionaryHeader from '@/components/dictionary/DictionaryHeader.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'
import { useI18n } from '@/composables/useI18n'
import { useDictionaryStore } from '@/stores/dictionary'

const props = defineProps({
  resultCount: {
    type: Number,
    required: true
  }
})

const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const filters = dictionaryStore.filters
const ui = dictionaryStore.ui

const hasAnyFilters = computed(() => {
  return Boolean(
    filters.search ||
    (filters.searchTags && filters.searchTags.length > 0) ||
    filters.school ||
    filters.subject ||
    filters.baseSkill ||
    filters.ultimate ||
    filters.excludeConsumed
  )
})
</script>

<template>
  <header class="header">
    <div class="section-header clickable" @click="ui.isSearchExpanded = !ui.isSearchExpanded">
      <div class="section-title">
        <Search :size="18" class="section-icon" />
        <span>技能搜尋</span>
      </div>
      <div class="section-actions">
        <button v-if="hasAnyFilters" class="btn-text danger clear-btn" @click.stop="dictionaryStore.resetAll">
          {{ t('ui.clearAll') }}
        </button>
        <div class="action-divider"></div>
        <div class="collapse-icon">
          <ChevronUp v-if="ui.isSearchExpanded" :size="20" />
          <ChevronDown v-else :size="20" />
        </div>
      </div>
    </div>

    <!-- Active filters visible when collapsed -->
    <div v-show="!ui.isSearchExpanded" class="topbar-content">
      <DictionaryResultBar :resultCount="resultCount" />
    </div>

    <!-- Expanded content -->
    <div v-show="ui.isSearchExpanded" class="search-section-body topbar-content">
      <DictionaryHeader />
      <DictionaryFilterPanel />
      <DictionaryResultBar :resultCount="resultCount" hideSearchChips />
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--bg-dark);
  padding: 16px 0;
  border-bottom: 1px solid var(--glass-border);
  transition: background-color 0.3s ease;
}

.topbar-content {
  padding: 0 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 4px solid var(--accent-cyan);
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.2s ease;
  margin-top: -16px;
  margin-bottom: 16px;
}

.section-header.clickable {
  cursor: pointer;
  user-select: none;
}

.section-header.clickable:hover {
  background: rgba(255, 255, 255, 0.05);
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
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
  border-radius: 6px;
}

.btn-text.danger {
  color: var(--danger);
}

.btn-text.danger:hover {
  background: var(--danger-bg);
  color: var(--danger-hover, #ff6b6b);
}

.collapse-icon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s;
}

.section-header:hover .collapse-icon {
  color: var(--text-primary);
}

.search-section-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
