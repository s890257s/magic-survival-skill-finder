<script setup>
import { RouterView } from 'vue-router'
import BottomNav from './components/layout/BottomNav.vue'
</script>

<template>
  <main class="content-area">
    <RouterView v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>
  
  <BottomNav />
</template>

<style scoped>
.content-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Page Transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
