<script setup>
import { computed, ref } from 'vue'
import { Globe, Check } from '@lucide/vue'
import DropdownPanel from '@/components/ui/DropdownPanel.vue'
import { useI18n } from '@/composables/useI18n'

const { locale, setLocale } = useI18n()

const isOpen = ref(false)
const triggerRef = ref(null)

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

    <DropdownPanel
      :isOpen="isOpen"
      @close="close"
      :style="{ 
        position: 'absolute',
        top: triggerRef?.getBoundingClientRect().bottom + 8 + 'px',
        left: triggerRef?.getBoundingClientRect().left - 40 + 'px'
      }"
    >
      <ul class="options-list">
        <li v-for="opt in options" :key="opt.value">
          <button
            type="button"
            class="option"
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



.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
}

.option:hover {
  background: var(--surface-hover);
}

.option.selected {
  background: var(--accent-cyan-bg);
  color: var(--accent-cyan);
}

.option-label {
  flex: 1;
  font-weight: 500;
}

.check {
  flex-shrink: 0;
}


</style>
