<script setup>
import { Sun, Moon } from '@lucide/vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button
    class="glass-icon-btn theme-toggle"
    @click="themeStore.toggleTheme"
    :aria-label="themeStore.theme === 'dark' ? '切換至淺色模式' : '切換至深色模式'"
  >
    <Transition name="icon-swap" mode="out-in">
      <Sun v-if="themeStore.theme === 'dark'" :size="20" />
      <Moon v-else :size="20" />
    </Transition>
  </button>
</template>

<style scoped>
.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.icon-swap-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>
