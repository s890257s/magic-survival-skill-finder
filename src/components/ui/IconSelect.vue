<script setup>
import { computed, ref, onBeforeUnmount, nextTick } from 'vue'
import { ChevronDown, Check, Search } from '@lucide/vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '請選擇',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // GameIcon 分類；null 表示純文字選單（如附魔）
  category: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const isOpen = ref(false)
const triggerRef = ref(null)
const panelStyle = ref({})
const panelRef = ref(null)

const searchQuery = ref('')
const searchInputRef = ref(null)

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label ? t(opt.label) : ''
})

const positionPanel = () => {
  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return
  const panelMaxHeight = 300
  const spaceBelow = window.innerHeight - rect.bottom
  const openUp = spaceBelow < panelMaxHeight && rect.top > spaceBelow
  panelStyle.value = {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    ...(openUp
      ? { bottom: `${window.innerHeight - rect.top + 4}px` }
      : { top: `${rect.bottom + 4}px` }),
  }
}

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(
    (opt) =>
      t(opt.label).toLowerCase().includes(q) || opt.label.toLowerCase().includes(q),
  )
})

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
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

const toggle = async () => {
  if (props.disabled) return
  if (isOpen.value) {
    close()
    return
  }
  positionPanel()
  isOpen.value = true
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', close)
  document.addEventListener('keydown', onKeydown)

  await nextTick()
  if (searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

const select = (value) => {
  emit('update:modelValue', value)
  close()
}

onBeforeUnmount(close)
</script>

<template>
  <div class="icon-select" :class="{ 'is-disabled': disabled }">
    <button
      ref="triggerRef"
      type="button"
      class="select-trigger"
      :class="{ 'is-open': isOpen, 'has-value': !!modelValue }"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <GameIcon
        v-if="category && modelValue"
        :name="String(modelValue)"
        :category="category"
        :size="22"
      />
      <span class="trigger-label" :class="{ 'is-placeholder': !modelValue }">
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDown class="select-icon" :class="{ flipped: isOpen }" :size="18" />
    </button>

    <Teleport to="body">
      <!-- 點擊面板外任意處關閉 -->
      <div v-if="isOpen" class="select-backdrop" @click="close"></div>
      <Transition name="panel-fade">
        <div ref="panelRef" v-if="isOpen" class="select-panel" :style="panelStyle" role="listbox">
          <div class="search-box" v-if="options.length > 5">
            <Search class="search-icon" :size="16" />
            <input
              ref="searchInputRef"
              type="text"
              v-model="searchQuery"
              placeholder="搜尋選項..."
              class="search-input"
              @keydown.enter.prevent
            />
          </div>
          <ul class="options-list">
            <li>
              <button
                type="button"
                class="option"
                :class="{ selected: !modelValue }"
                role="option"
                :aria-selected="!modelValue"
                @click="select('')"
              >
                <span class="option-label muted">{{ placeholder }}</span>
                <Check v-if="!modelValue" :size="16" class="check" />
              </button>
            </li>
            <li v-for="opt in filteredOptions" :key="opt.value">
              <button
                type="button"
                class="option"
                :class="{ selected: opt.value === modelValue }"
                role="option"
                :aria-selected="opt.value === modelValue"
                @click="select(opt.value)"
              >
                <GameIcon
                  v-if="category"
                  :name="String(opt.value)"
                  :category="category"
                  :size="24"
                />
                <span class="option-label">
                  {{ t(opt.label) }}
                </span>
                <Check v-if="opt.value === modelValue" :size="16" class="check" />
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.icon-select {
  width: 100%;
}

.select-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 11px 12px;
  font-size: 0.95rem;
  font-family: var(--font-body);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  text-align: left;
  min-height: 48px;
}

.select-trigger.is-open,
.select-trigger:focus-visible {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}

.select-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.trigger-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-label.is-placeholder {
  color: var(--text-muted);
}

.select-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.select-icon.flipped {
  transform: rotate(180deg);
}

.select-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1500;
  background: transparent;
}

.select-panel {
  z-index: 1600;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-strong);
  padding: 6px;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 4px;
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.options-list {
  max-height: 250px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: var(--font-body);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease;
  min-height: 44px;
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
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.en-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
}

.option-label.muted {
  color: var(--text-muted);
}

.option.selected .option-label.muted {
  color: inherit;
}

.check {
  flex-shrink: 0;
}

.panel-fade-enter-active,
.panel-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
