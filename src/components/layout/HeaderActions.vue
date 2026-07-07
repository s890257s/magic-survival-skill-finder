<script setup>
import LangToggle from '@/components/ui/LangToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LocaleToggle from '@/components/ui/LocaleToggle.vue'
</script>

<template>
  <div class="header-actions-group">
    <LocaleToggle class="toggle" />
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
</style>
