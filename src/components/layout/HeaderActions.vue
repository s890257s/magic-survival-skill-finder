<script setup>
import LangToggle from '@/components/ui/LangToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

defineProps({
  // 窄版尺寸（配裝頁 header 空間較擠）
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="header-actions-group" :class="{ compact }">
    <LangToggle class="toggle" />
    <ThemeToggle class="toggle" />
  </div>
</template>

<style scoped>
.header-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.compact .toggle {
  width: 40px;
  height: 40px;
}
</style>
