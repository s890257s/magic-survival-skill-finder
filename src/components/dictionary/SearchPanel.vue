<script setup>
import { nextTick } from 'vue'
import DictionaryHeader from '@/components/dictionary/DictionaryHeader.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'
import LangToggle from '@/components/ui/LangToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LocaleToggle from '@/components/ui/LocaleToggle.vue'
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
const ui = dictionaryStore.ui

const viewResults = () => {
  ui.isDockExpanded = false
  // 等 body 捲動鎖解除後再捲動
  nextTick(() => {
    document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>

<template>
  <div class="search-panel">
    <DictionaryHeader />
    <DictionaryFilterPanel />

    <div class="panel-result-row">
      <DictionaryResultBar :resultCount="resultCount" />
      <button
        v-if="dictionaryStore.hasAnyFilters"
        class="btn-text danger panel-clear-btn"
        @click="dictionaryStore.resetAll"
      >
        {{ t('ui.clearAll') }}
      </button>
    </div>

    <div class="panel-divider"></div>
    <div class="panel-footer">
      <div class="panel-settings">
        <LocaleToggle />
        <LangToggle />
        <ThemeToggle />
      </div>
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
  background: none;
  border: none;
  color: var(--danger);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.panel-clear-btn:hover {
  color: var(--danger-hover, #ff6b6b);
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

.panel-settings {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-results-btn {
  flex: 1;
  min-width: 160px;
  justify-content: center;
}
</style>
