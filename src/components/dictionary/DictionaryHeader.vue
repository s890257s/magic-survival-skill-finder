<script setup>
import { computed } from 'vue'
import { Search, X } from '@lucide/vue'
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
  <div class="search-bar">
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
