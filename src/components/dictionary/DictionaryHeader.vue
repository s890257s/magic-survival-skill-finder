<script setup>
import { computed } from 'vue'
import { Search, X } from '@lucide/vue'
import { gameVersion } from '@/data/meta'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const search = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const clearSearch = () => {
  search.value = ''
}
</script>

<template>
  <div class="app-header-container">
    <div class="app-header">
      <h1 class="app-title">
        {{ t('ui.magicSurvival') }}
        <span class="version-tag">v{{ gameVersion }}</span>
      </h1>
    </div>
    <div class="search-bar">
      <HeaderActions />

      <div class="search-wrapper">
        <Search class="search-icon" :size="20" />
        <input
          type="text"
          v-model="search"
          :placeholder="t('ui.dict.searchPlaceholder')"
          class="search-input"
        />
        <button
          v-if="search"
          @click="clearSearch"
          class="btn btn-icon-rounded clear-search"
          :aria-label="t('ui.dict.clearSearch')"
        >
          <X :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-header-container {
  display: flex;
  flex-direction: column;
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
}

.search-input:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}
</style>
