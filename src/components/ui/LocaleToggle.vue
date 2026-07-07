<script setup>
import { computed } from 'vue'
import { Globe } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'

const { locale, setLocale } = useI18n()

const locales = ['zh-TW', 'zh-CN', 'en']
const localeLabels = {
  'zh-TW': '繁',
  'zh-CN': '简',
  en: 'EN'
}

const toggleLocale = () => {
  const currentIndex = locales.indexOf(locale.value)
  const nextIndex = (currentIndex + 1) % locales.length
  setLocale(locales[nextIndex])
}

const currentLabel = computed(() => localeLabels[locale.value] || 'EN')
</script>

<template>
  <button
    class="locale-toggle"
    @click="toggleLocale"
    :aria-label="`切換語系，目前為 ${locale}`"
  >
    <Globe :size="20" />
    <span class="locale-text">{{ currentLabel }}</span>
  </button>
</template>

<style scoped>
.locale-toggle {
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

.locale-toggle:hover {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.locale-text {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}
</style>
