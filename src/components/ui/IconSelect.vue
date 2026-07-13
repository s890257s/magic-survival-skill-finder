<script setup>
import { computed, ref, nextTick } from 'vue'
import { ChevronDown, Check, Search } from '@lucide/vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import DropdownPanel from '@/components/ui/DropdownPanel.vue'
import { useI18n } from '@/composables/useI18n'
import { useDropdown } from '@/composables/useDropdown'
import { isDesktopWidth } from '@/utils/device'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  // 選項名稱字串陣列（同時是 i18n key，顯示時以 t() 翻譯）
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'ui.select.placeholder',
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

const dropdown = useDropdown()
const { isOpen, triggerRef, panelStyle } = dropdown

const searchQuery = ref('')
const searchInputRef = ref(null)

const selectedLabel = computed(() => (props.modelValue ? t(props.modelValue) : ''))

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(
    (opt) => t(opt).toLowerCase().includes(q) || opt.toLowerCase().includes(q),
  )
})

// 關閉時一併清空面板內的搜尋字
const close = () => {
  dropdown.close()
  searchQuery.value = ''
}

const toggle = async () => {
  if (props.disabled) return
  if (isOpen.value) {
    close()
    return
  }
  dropdown.open()

  await nextTick()
  if (searchInputRef.value && isDesktopWidth()) {
    // preventScroll：聚焦引發的捲動會被 DropdownPanel 誤判為外部捲動而關閉面板
    searchInputRef.value.focus({ preventScroll: true })
  }
}

const select = (value) => {
  emit('update:modelValue', value)
  close()
}
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
        :name="modelValue"
        :category="category"
        class="select-trigger-icon"
      />
      <span class="trigger-label" :class="{ 'is-placeholder': !modelValue }">
        {{ selectedLabel || t(placeholder) }}
      </span>
      <ChevronDown class="select-icon" :class="{ flipped: isOpen }" :size="18" />
    </button>

    <DropdownPanel
      :isOpen="isOpen"
      @close="close"
      :style="panelStyle"
    >
      <div class="search-box" v-if="options.length > 5">
        <Search class="search-icon" :size="16" />
        <input
          ref="searchInputRef"
          type="text"
          v-model="searchQuery"
          :placeholder="t('ui.select.search')"
          class="search-input"
          @keydown.enter.prevent
        />
      </div>
      <ul class="dropdown-options" role="listbox">
        <li>
          <button
            type="button"
            class="dropdown-option"
            :class="{ selected: !modelValue }"
            role="option"
            :aria-selected="!modelValue"
            @click="select('')"
          >
            <span class="option-label muted">{{ t(placeholder) }}</span>
            <Check v-if="!modelValue" :size="16" class="check" />
          </button>
        </li>
        <li v-for="opt in filteredOptions" :key="opt">
          <button
            type="button"
            class="dropdown-option"
            :class="{ selected: opt === modelValue }"
            role="option"
            :aria-selected="opt === modelValue"
            @click="select(opt)"
          >
            <GameIcon
              v-if="category"
              :name="opt"
              :category="category"
              class="select-option-icon"
            />
            <span class="option-label">
              {{ t(opt) }}
            </span>
            <Check v-if="opt === modelValue" :size="16" class="check" />
          </button>
        </li>
      </ul>
    </DropdownPanel>
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

.select-trigger-icon {
  --icon-size: var(--icon-size-select-trigger, 22px);
}

.select-option-icon {
  --icon-size: var(--icon-size-select-option, 24px);
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

/* 選單樣式沿用全域 .dropdown-options / .dropdown-option，此處只放本元件差異 */
.option-label.muted {
  color: var(--text-muted);
}

.dropdown-option.selected .option-label.muted {
  color: inherit;
}
</style>
