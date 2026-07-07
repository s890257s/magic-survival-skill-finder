<script setup>
import { Languages } from '@lucide/vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/composables/useI18n'

const settingsStore = useSettingsStore()
const { locale } = useI18n()
</script>

<template>
  <button
    class="lang-toggle"
    :class="{ active: settingsStore.showEnglish, disabled: locale === 'en' }"
    :disabled="locale === 'en'"
    @click="settingsStore.toggleEnglish"
    :aria-label="settingsStore.showEnglish ? '隱藏英文' : '顯示英文'"
    :title="locale === 'en' ? '目前語系為英文，無法啟用雙語顯示' : ''"
  >
    <Languages :size="20" />
    <span class="lang-text">EN</span>
  </button>
</template>

<style scoped>
.lang-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 12px;
  min-width: 64px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.lang-toggle.active {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
}

.lang-toggle:hover:not(:disabled) {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.lang-toggle:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}

.lang-text {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}
</style>
