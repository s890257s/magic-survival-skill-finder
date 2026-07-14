<script setup>
import { computed } from 'vue'
import { Globe } from '@lucide/vue'
import DropdownPanel from '@/components/ui/DropdownPanel.vue'
import DropdownOption from '@/components/ui/DropdownOption.vue'
import { useI18n } from '@/composables/useI18n'
import { useDropdown } from '@/composables/useDropdown'

const { locale, setLocale, t } = useI18n()

// icon 按鈕觸發：面板寬度不對齊、靠右緣展開
const { isOpen, triggerRef, panelStyle, close, toggle } = useDropdown({
  matchWidth: false,
  align: 'end',
})

const options = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' }
]

const currentLabel = computed(() => {
  const opt = options.find((o) => o.value === locale.value)
  if (!opt) return 'EN'
  if (locale.value === 'en') return 'EN'
  if (locale.value === 'ja') return '日'
  if (locale.value === 'ko') return '한'
  return opt.label[0]
})

const select = (value) => {
  setLocale(value)
  close()
}
</script>

<template>
  <div class="locale-dropdown">
    <button
      ref="triggerRef"
      type="button"
      class="glass-icon-btn locale-toggle"
      :class="{ 'is-open': isOpen }"
      @click="toggle"
      :aria-label="t('ui.toggle.switchLocale', locale)"
    >
      <Globe :size="20" />
      <span class="locale-text">{{ currentLabel }}</span>
    </button>

    <DropdownPanel :isOpen="isOpen" @close="close" :style="panelStyle">
      <ul class="dropdown-options">
        <DropdownOption
          v-for="opt in options"
          :key="opt.value"
          :label="opt.label"
          :selected="opt.value === locale"
          @select="select(opt.value)"
        />
      </ul>
    </DropdownPanel>
  </div>
</template>

<style scoped>
.locale-dropdown {
  position: relative;
}

.locale-toggle.is-open {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}

.locale-text {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}
</style>
