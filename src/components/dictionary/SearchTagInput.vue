<script setup>
import { computed, ref } from 'vue'
import { Search, X } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { useDictionaryStore } from '@/stores/dictionary'

// 搜尋標籤輸入列：輸入中的字即時篩選，Enter 固定成 tag（多關鍵字 AND），狀態直接讀寫 store
const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const filters = dictionaryStore.filters

const searchInputRef = ref(null)

const addTag = () => {
  const val = filters.search.trim()
  if (val && !filters.searchTags.includes(val)) {
    filters.searchTags.push(val)
  }
  filters.search = ''
}

const removeTag = (index) => {
  filters.searchTags.splice(index, 1)
}

const handleBackspace = () => {
  if (filters.search === '' && filters.searchTags.length > 0) {
    filters.searchTags.pop()
  }
}

const clearSearch = () => {
  filters.search = ''
  filters.searchTags = []
}

const hasSearch = computed(() => filters.search !== '' || filters.searchTags.length > 0)

const focusInput = () => {
  searchInputRef.value?.focus()
}
</script>

<template>
  <div class="search-bar">
    <div class="search-wrapper" @click="focusInput">
      <Search class="search-icon" :size="20" />
      
      <div class="search-input-container">
        <span v-for="(tag, index) in filters.searchTags" :key="index" class="search-tag">
          {{ tag }}
          <button @click.stop="removeTag(index)" class="tag-remove-btn">
            <X :size="14" />
          </button>
        </span>

        <input
          ref="searchInputRef"
          type="text"
          v-model="filters.search"
          @keydown.enter.prevent="addTag"
          @keydown.backspace="handleBackspace"
          :placeholder="filters.searchTags.length === 0 ? t('ui.dict.searchPlaceholder') : ''"
          class="search-input"
        />
      </div>

      <button
        v-if="hasSearch"
        @click.stop="clearSearch"
        class="btn btn-icon-rounded clear-search"
        :aria-label="t('ui.dict.clearSearch')"
      >
        <X :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.search-wrapper {
  flex: 1 1 100%;
  display: flex;
  position: relative;
  align-items: center;
  min-width: 0;
  
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 8px 40px 8px 48px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  cursor: text;
  min-height: 46px;
}

.search-wrapper:focus-within {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  pointer-events: none;
}

.search-input-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  color: var(--accent-cyan);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
}

.tag-remove-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  color: var(--accent-cyan);
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.tag-remove-btn:hover {
  opacity: 1;
}

.search-input {
  flex: 1;
  min-width: 60px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 1rem;
  outline: none;
  padding: 4px 0;
}

.clear-search {
  position: absolute;
  right: 12px;
}
</style>
