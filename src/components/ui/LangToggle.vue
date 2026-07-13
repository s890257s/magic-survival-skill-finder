<script setup>
import { Languages } from '@lucide/vue'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from '@/composables/useI18n'

const settingsStore = useSettingsStore()
const { locale, t } = useI18n()
</script>

<template>
  <button
    class="glass-icon-btn lang-toggle"
    :class="{ active: settingsStore.showEnglish, disabled: locale === 'en' }"
    :disabled="locale === 'en'"
    @click="settingsStore.toggleEnglish"
    :aria-label="settingsStore.showEnglish ? t('ui.toggle.hideEnglish') : t('ui.toggle.showEnglish')"
    :title="locale === 'en' ? t('ui.toggle.englishDisabled') : ''"
  >
    <Languages :size="20" />
    <span class="lang-text">EN</span>
  </button>
</template>

<style scoped>
.lang-toggle.active {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
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
