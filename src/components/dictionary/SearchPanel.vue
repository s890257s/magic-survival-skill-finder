<script setup>
import { computed, nextTick } from 'vue'
import SearchTagInput from '@/components/dictionary/SearchTagInput.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import { RESULTS_ANCHOR_ID } from '@/constants/dom'
import { useI18n } from '@/composables/useI18n'
import { useDictionaryStore } from '@/stores/dictionary'

const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const ui = dictionaryStore.ui

const resultCount = computed(() => dictionaryStore.filteredSkills.length)

const viewResults = () => {
  ui.isDockExpanded = false
  // 等 body 捲動鎖解除後再捲動
  nextTick(() => {
    document.getElementById(RESULTS_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="search-panel">
    <SearchTagInput />
    <DictionaryFilterPanel />

    <div class="panel-result-row">
      <DictionaryResultBar />
      <button
        v-if="dictionaryStore.hasAnyFilters"
        class="text-action danger panel-clear-btn"
        @click="dictionaryStore.resetAll"
      >
        {{ t('ui.clearAll') }}
      </button>
    </div>

    <div class="panel-divider"></div>
    <div class="panel-footer">
      <HeaderActions />
      <button class="btn btn-primary view-results-btn" @click="viewResults">
        {{ t('ui.dict.viewResults', resultCount) }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-panel {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.panel-result-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.panel-result-row :deep(.result-bar) {
  flex: 1;
  min-width: 0;
}

.panel-clear-btn {
  flex-shrink: 0;
  margin-top: 12px;
}

.panel-divider {
  height: 1px;
  background: var(--glass-border);
  margin: 16px 0 12px;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.view-results-btn {
  flex: 1;
  min-width: 160px;
  justify-content: center;
}
</style>
