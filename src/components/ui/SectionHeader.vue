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
      <span class="title-text"><slot /></span>
      <span v-if="count !== null" class="count-badge">{{ count }}</span>
    </div>
    
    <div v-if="$slots.actions" class="section-actions" @click.stop>
      <slot name="actions" />
    </div>
    
    <div class="collapse-icon">
      <ChevronUp v-if="expanded" :size="20" />
      <ChevronDown v-else :size="20" />
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-dark);
  border-left: 4px solid var(--accent-cyan);
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 16px;
  transition: background 0.2s ease;
  cursor: pointer;
  user-select: none;
  
  position: sticky;
  /* 預設吸附頂端；Dictionary 頁由 --section-sticky-top 讓位給 sticky 搜尋列 */
  top: var(--section-sticky-top, 0);
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
  white-space: nowrap;
  
  order: 1;
  flex: 1 1 auto;
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

.collapse-icon {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  transition: color 0.2s;
  
  order: 2;
  flex-shrink: 0;
}

.section-header:hover .collapse-icon {
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  order: 3;
  width: 100%;
  margin-top: 12px;
}

@media (min-width: 768px) {
  .section-header {
    flex-wrap: nowrap;
  }
  
  .section-title {
    flex: 0 1 auto;
  }
  
  .section-actions {
    order: 2;
    width: auto;
    margin-top: 0;
    margin-left: auto;
    margin-right: 16px;
  }
  
  .collapse-icon {
    order: 3;
  }
}

/* actions slot 的按鈕樣式為全域 .text-action / .action-btn / .action-divider（main.css） */
</style>
