<script setup>
import { useI18n } from '@/composables/useI18n'

defineProps({
  text: {
    type: String,
    required: true,
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  actionText: {
    type: String,
    default: '',
  },
})

defineEmits(['action'])

const { t } = useI18n()
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon-wrap flex-center">
      <slot name="icon"></slot>
    </div>
    <p>{{ text }}</p>
    <button v-if="showAction" class="btn btn-primary" @click="$emit('action')">
      {{ actionText }}
    </button>
    <slot name="action-slot"></slot>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  gap: 16px;
  height: 100%;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
}
</style>
