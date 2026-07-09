<script setup>
import { Search } from '@lucide/vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import DictionaryHeader from '@/components/dictionary/DictionaryHeader.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'
import { useI18n } from '@/composables/useI18n'
import { useDictionaryStore } from '@/stores/dictionary'

defineProps({
  resultCount: {
    type: Number,
    required: true
  }
})

const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const ui = dictionaryStore.ui
</script>

<template>
  <header class="header">
    <SectionHeader
      class="topbar-section-header"
      :expanded="ui.isSearchExpanded"
      @toggle="ui.isSearchExpanded = !ui.isSearchExpanded"
    >
      <template #icon><Search :size="18" /></template>
      {{ t('ui.dict.searchTitle') }}
      <template #actions>
        <button
          v-if="dictionaryStore.hasAnyFilters"
          class="btn-text danger"
          @click.stop="dictionaryStore.resetAll"
        >
          {{ t('ui.clearAll') }}
        </button>
        <div class="action-divider"></div>
      </template>
    </SectionHeader>

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

.topbar-section-header {
  margin-top: -16px;
}

.topbar-content {
  padding: 0 16px;
}

.action-divider {
  width: 1px;
  height: 14px;
  background: var(--glass-border);
}

.search-section-body {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
