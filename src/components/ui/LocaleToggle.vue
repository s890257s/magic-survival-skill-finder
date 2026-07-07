<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { Globe, Check } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'

const { locale, setLocale } = useI18n()

const isOpen = ref(false)
const triggerRef = ref(null)
const panelRef = ref(null)

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
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', close)
  document.removeEventListener('keydown', onKeydown)
}

const onScroll = (e) => {
  if (panelRef.value && (e.target === panelRef.value || panelRef.value.contains(e.target))) {
    return
  }
  close()
}

const onKeydown = (e) => {
  if (e.key === 'Escape') close()
}

const toggle = () => {
  if (isOpen.value) {
    close()
    return
  }
  isOpen.value = true
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', close)
  document.addEventListener('keydown', onKeydown)
}

const select = (value) => {
  setLocale(value)
  close()
}

onBeforeUnmount(close)
</script>

<template>
  <div class="locale-dropdown">
    <button
      ref="triggerRef"
      type="button"
      class="locale-toggle"
      :class="{ 'is-open': isOpen }"
      @click="toggle"
      :aria-label="`切換語系，目前為 ${locale}`"
    >
      <Globe :size="20" />
      <span class="locale-text">{{ currentLabel }}</span>
    </button>

    <Teleport to="body">
      <div v-if="isOpen" class="dropdown-backdrop" @click="close"></div>
      <Transition name="panel-fade">
        <div 
          ref="panelRef" 
          v-if="isOpen" 
          class="dropdown-panel"
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
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.locale-dropdown {
  position: relative;
}

.locale-toggle {
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

.locale-toggle.is-open {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
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

.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: transparent;
}

.dropdown-panel {
  z-index: 1600;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-strong);
  padding: 6px;
  min-width: 120px;
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
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

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
