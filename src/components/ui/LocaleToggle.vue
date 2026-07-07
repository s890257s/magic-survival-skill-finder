<script setup>
import { computed, ref } from 'vue'
import { Globe, Check } from '@lucide/vue'
import DropdownPanel from '@/components/ui/DropdownPanel.vue'
import { useI18n } from '@/composables/useI18n'
import { usePanelPosition } from '@/composables/usePanelPosition'

const { locale, setLocale } = useI18n()

const isOpen = ref(false)
const triggerRef = ref(null)
// icon 按鈕觸發：面板寬度不對齊、靠右緣展開
const { panelStyle, positionPanel } = usePanelPosition(triggerRef, {
  matchWidth: false,
  align: 'end',
})

const options = [
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' }
]

const currentLabel = computed(() => {
  const opt = options.find((o) => o.value === locale.value)
  return opt ? (locale.value === 'en' ? 'EN' : opt.label[0]) : 'EN'
})

const close = () => {
  isOpen.value = false
}

const toggle = () => {
  if (isOpen.value) {
    close()
    return
  }
  positionPanel()
  isOpen.value = true
}

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
      :aria-label="`切換語系，目前為 ${locale}`"
    >
      <Globe :size="20" />
      <span class="locale-text">{{ currentLabel }}</span>
    </button>

    <DropdownPanel :isOpen="isOpen" @close="close" :style="panelStyle">
      <ul class="dropdown-options">
        <li v-for="opt in options" :key="opt.value">
          <button
            type="button"
            class="dropdown-option"
            :class="{ selected: opt.value === locale }"
            @click="select(opt.value)"
          >
            <span class="option-label">{{ opt.label }}</span>
            <Check v-if="opt.value === locale" :size="16" class="check" />
          </button>
        </li>
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
