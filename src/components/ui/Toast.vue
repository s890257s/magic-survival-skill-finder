<script setup>
import { onMounted, onUnmounted } from 'vue'
import { CheckCircle2, AlertCircle, Info } from '@lucide/vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info' // 'success', 'warning', 'info'
  },
  duration: {
    type: Number,
    default: 3000
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'action'])

let timer = null

onMounted(() => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      emit('close')
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <div class="toast" :class="`toast-${type}`">
    <CheckCircle2 v-if="type === 'success'" class="toast-icon" :size="20" />
    <AlertCircle v-else-if="type === 'warning'" class="toast-icon" :size="20" />
    <Info v-else class="toast-icon" :size="20" />
    <span class="toast-message">{{ message }}</span>
    <button v-if="actionLabel" class="toast-action" @click="emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: min(90vw, 400px);
  padding: 14px 18px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: var(--shadow-strong);
  color: var(--text-primary);
  font-family: var(--font-body);
  pointer-events: auto;
}

.toast-icon {
  flex-shrink: 0;
}

.toast-success .toast-icon { color: var(--accent-cyan); }
.toast-warning .toast-icon { color: var(--danger); }
.toast-info .toast-icon { color: var(--accent-purple); }

.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
  flex: 1;
}

.toast-action {
  flex-shrink: 0;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  color: var(--accent-cyan);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toast-action:hover {
  background: var(--accent-cyan-bg-strong);
}
</style>
