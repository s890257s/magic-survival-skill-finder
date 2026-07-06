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
  }
})

const emit = defineEmits(['close'])

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
  </div>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  padding: 16px 20px;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  color: var(--text-primary);
  font-family: var(--font-body);
  pointer-events: auto;
}

.toast-success .toast-icon { color: var(--accent-cyan); }
.toast-warning .toast-icon { color: #ff5555; }
.toast-info .toast-icon { color: var(--accent-purple); }

.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
}
</style>
