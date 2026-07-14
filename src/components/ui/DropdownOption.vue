<script setup>
import { Check } from '@lucide/vue'

// 下拉選單的單一選項（li + button + 勾選圖示）；樣式沿用全域 .dropdown-option
defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  // 淡化顯示（如「全部」placeholder 選項）
  muted: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select'])
</script>

<template>
  <li>
    <button
      type="button"
      class="dropdown-option"
      :class="{ selected }"
      role="option"
      :aria-selected="selected"
      @click="emit('select')"
    >
      <slot name="icon"></slot>
      <span class="option-label" :class="{ muted }">{{ label }}</span>
      <Check v-if="selected" :size="16" class="check" />
    </button>
  </li>
</template>

<style scoped>
.option-label.muted {
  color: var(--text-muted);
}

.dropdown-option.selected .option-label.muted {
  color: inherit;
}
</style>
