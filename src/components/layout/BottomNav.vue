<script setup>
import { RouterLink } from 'vue-router'
import { BookOpen, Wrench } from '@lucide/vue'
import { useFavoritesStore } from '../../stores/favorites'

const favoritesStore = useFavoritesStore()
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink to="/" class="nav-item">
      <BookOpen class="nav-icon" :size="24" />
      <span>圖鑑</span>
    </RouterLink>
    <RouterLink to="/builder" class="nav-item">
      <div class="icon-wrap">
        <Wrench class="nav-icon" :size="24" />
        <Transition name="badge-pop">
          <span
            v-if="favoritesStore.count > 0"
            class="badge"
            :class="{ over: favoritesStore.isOverLimit }"
          >
            {{ favoritesStore.count }}
          </span>
        </Transition>
      </div>
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

.icon-wrap {
  position: relative;
}

.badge {
  position: absolute;
  top: -6px;
  right: -12px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--accent-purple);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.badge.over {
  background: var(--danger);
}

.badge-pop-enter-active {
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
}

.badge-pop-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.badge-pop-enter-from,
.badge-pop-leave-to {
  transform: scale(0);
  opacity: 0;
}

.nav-icon {
  transition: transform 0.3s ease;
}

.nav-item.router-link-active {
  color: var(--accent-cyan);
}

.nav-item.router-link-active .nav-icon {
  transform: translateY(-2px);
  filter: drop-shadow(0 0 8px var(--accent-cyan-glow));
}
</style>
