<script setup>
import { ChevronDown } from '@lucide/vue';

defineProps({
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
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="form-select-wrapper" :class="{ 'is-disabled': disabled }">
    <select 
      class="form-select" 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :disabled="disabled"
    >
      <option value="" disabled selected hidden>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
    <ChevronDown class="select-icon" :size="18" />
  </div>
</template>

<style scoped>
.form-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.form-select {
  width: 100%;
  appearance: none;
  background: var(--glass-bg);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 40px 12px 16px;
  font-size: 1rem;
  font-family: var(--font-body);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.form-select:focus {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px rgba(0, 240, 255, 0.2);
}

.form-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.form-select option {
  background-color: var(--bg-surface);
  color: var(--text-primary);
}
</style>
