<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { ChevronDown, Check } from '@lucide/vue'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '請選擇'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // GameIcon 分類；null 表示純文字選單（如附魔）
  category: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const triggerRef = ref(null)
const panelStyle = ref({})

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt?.label ?? ''
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

const close = () => {
  isOpen.value = false
  window.removeEventListener('scroll', close, true)
  window.removeEventListener('resize', close)
  document.removeEventListener('keydown', onKeydown)
}

const onKeydown = (e) => {
  if (e.key === 'Escape') close()
}

const toggle = () => {
  if (props.disabled) return
  if (isOpen.value) {
    close()
    return
  }
  positionPanel()
  isOpen.value = true
  window.addEventListener('scroll', close, true)
  window.addEventListener('resize', close)
  document.addEventListener('keydown', onKeydown)
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
        <ul v-if="isOpen" class="select-panel" :style="panelStyle" role="listbox">
          <li>
            <button type="button" class="option" :class="{ selected: !modelValue }" @click="select('')">
              <span class="option-label muted">{{ placeholder }}</span>
              <Check v-if="!modelValue" :size="16" class="check" />
            </button>
          </li>
          <li v-for="opt in options" :key="opt.value">
            <button
              type="button"
              class="option"
              :class="{ selected: opt.value === modelValue }"
              role="option"
              :aria-selected="opt.value === modelValue"
              @click="select(opt.value)"
            >
              <GameIcon v-if="category" :name="String(opt.value)" :category="category" :size="24" />
              <span class="option-label">{{ opt.label }}</span>
              <Check v-if="opt.value === modelValue" :size="16" class="check" />
            </button>
          </li>
        </ul>
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
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
  max-height: 300px;
  overflow-y: auto;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-strong);
  padding: 6px;
  margin: 0;
  list-style: none;
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
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.panel-fade-enter-from,
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
