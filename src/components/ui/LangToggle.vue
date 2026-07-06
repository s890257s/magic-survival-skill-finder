<script setup>
import { Languages } from '@lucide/vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>

<template>
  <button
    class="lang-toggle"
    :class="{ active: settingsStore.showEnglish }"
    @click="settingsStore.toggleEnglish"
    :aria-label="settingsStore.showEnglish ? '隱藏英文' : '顯示英文'"
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
  width: 64px;
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

.lang-toggle:hover {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.lang-text {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}
</style>
