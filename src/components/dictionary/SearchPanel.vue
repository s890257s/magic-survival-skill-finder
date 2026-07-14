<script setup>
import { computed, nextTick } from 'vue'
import SearchTagInput from '@/components/dictionary/SearchTagInput.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'
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
    <div class="panel-toolbar">
      <button
        v-if="dictionaryStore.hasAnyFilters"
        class="text-action danger"
        @click="dictionaryStore.resetAll"
      >
        {{ t('ui.clearAll') }}
      </button>
      <div class="action-divider" v-if="dictionaryStore.hasAnyFilters"></div>
      <button class="btn btn-primary view-results-btn" @click="viewResults">
        {{ t('ui.dict.viewResults', resultCount) }}
      </button>
    </div>

    <div class="panel-content">
      <SearchTagInput />
      <DictionaryFilterPanel />
      <DictionaryResultBar />
    </div>
  </div>
</template>

<style scoped>
.search-panel {
  padding-bottom: 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-content {
  padding: 16px;
  flex: 1;
}

.view-results-btn {
  padding: 6px 12px;
  font-size: 0.85rem;
}
</style>
