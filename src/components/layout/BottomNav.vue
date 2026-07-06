<script setup>
import { RouterLink } from 'vue-router'
import { BookOpen, Wrench } from '@lucide/vue'
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="nav-item">
      <BookOpen class="nav-icon" :size="24" />
      <span>圖鑑</span>
    </RouterLink>
    <RouterLink to="/builder" class="nav-item">
      <Wrench class="nav-icon" :size="24" />
      <span>配裝</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
  width: 100px;
  height: 100%;
  transition: all 0.3s ease;
}

.nav-icon {
  transition: transform 0.3s ease;
}

.nav-item.router-link-active {
  color: var(--accent-cyan);
}

.nav-item.router-link-active .nav-icon {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.6));
}
</style>
