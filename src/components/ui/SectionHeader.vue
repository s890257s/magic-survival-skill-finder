<script setup>
import { ChevronUp, ChevronDown } from '@lucide/vue'

defineProps({
  expanded: {
    type: Boolean,
    required: true,
  },
  // 顯示在標題旁的數量徽章；null 表示不顯示
  count: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['toggle'])
</script>

<template>
  <div class="section-header" @click="emit('toggle')">
    <div class="section-title">
      <span class="section-icon"><slot name="icon" /></span>
      <span><slot /></span>
      <span v-if="count !== null" class="count-badge">{{ count }}</span>
    </div>
    <div class="section-actions">
      <slot name="actions" />
      <div class="collapse-icon">
        <ChevronUp v-if="expanded" :size="20" />
        <ChevronDown v-else :size="20" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-dark);
  border-left: 4px solid var(--accent-cyan);
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 16px;
  transition: background 0.2s ease;
  cursor: pointer;
  user-select: none;
  
  position: sticky;
  top: 0;
  z-index: 90;
}

.section-header:hover {
  background: var(--bg-surface);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.section-icon {
  display: flex;
  align-items: center;
  color: var(--accent-cyan);
}

.count-badge {
  background: var(--glass-bg);
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-icon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s;
}

.section-header:hover .collapse-icon {
  color: var(--text-primary);
}

/* --- actions slot 內容的共用樣式（各 section 的操作列一致） --- */
:slotted(.btn-text) {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

:slotted(.btn-text:hover:not(:disabled)) {
  color: var(--text-primary);
}

:slotted(.btn-text.danger) {
  color: var(--danger);
}

:slotted(.btn-text.danger:hover:not(:disabled)) {
  color: var(--danger-hover, #ff6b6b);
}

:slotted(.btn-text:disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

:slotted(.action-divider) {
  width: 1px;
  height: 14px;
  background: var(--glass-border);
}

:slotted(.action-btn) {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

:slotted(.action-btn:hover:not(:disabled)) {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

:slotted(.action-btn:disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
