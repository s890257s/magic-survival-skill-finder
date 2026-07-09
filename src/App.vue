<script setup>
import { RouterView } from 'vue-router'
import Toast from '@/components/ui/Toast.vue'
import { useToastStore } from '@/stores/toast'
import { useThemeStore } from '@/stores/theme'

const toastStore = useToastStore()
useThemeStore() // 初始化主題（套用 data-theme）

const handleAction = (toast) => {
  toast.onAction?.()
  toastStore.dismiss(toast.id)
}
</script>

<template>
  <main class="content-area">
    <RouterView />
  </main>

  <!-- Global Toasts -->
  <div class="toast-stack" role="status" aria-live="polite">
    <TransitionGroup name="toast-slide">
      <Toast
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        :actionLabel="toast.actionLabel"
        @close="toastStore.dismiss(toast.id)"
        @action="handleAction(toast)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.content-area {
  flex: 1;
  overflow-x: hidden;
}

/* Toast Stack */
.toast-stack {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast, 2000);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
