<script setup>
import { useI18n } from '@/composables/useI18n'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['expand-all', 'collapse-all'])
const { t } = useI18n()
</script>

<template>
  <button class="header-action-btn" @click.stop="emit('expand-all')" :disabled="disabled">
    {{ t('ui.dict.expandSkills') }}
  </button>
  <button class="header-action-btn" @click.stop="emit('collapse-all')" :disabled="disabled">
    {{ t('ui.dict.collapseSkills') }}
  </button>
  <div class="action-divider"></div>
</template>

<style scoped>
.header-action-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 12px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 放大隱形點擊區（向上下補齊 SectionHeader 的 padding） */
.header-action-btn::after {
  content: '';
  position: absolute;
  top: -12px;
  bottom: -12px;
  left: -4px;
  right: -4px;
}

.header-action-btn:hover:not(:disabled) {
  background: var(--glass-bg);
  color: var(--text-primary);
  border-color: var(--text-muted);
}

.header-action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: transparent;
}

@media (max-width: 767px) {
  .header-action-btn {
    flex: 1;
    padding: 6px 4px;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* 手機版按鈕均分，不需要分隔線 */
  .action-divider {
    display: none;
  }
}
</style>
