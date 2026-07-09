<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Settings2, X, ChevronsDown, ChevronsUp, ArrowRightLeft } from '@lucide/vue'
import { useDictionaryStore } from '@/stores/dictionary'
import LangToggle from '@/components/ui/LangToggle.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LocaleToggle from '@/components/ui/LocaleToggle.vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const dictionaryStore = useDictionaryStore()
const ui = dictionaryStore.ui

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

// 點擊外部關閉選單
const handleClickOutside = (e) => {
  if (isOpen.value && !e.target.closest('.dictionary-fab-container')) {
    closeMenu()
  }
}

// 滾動時自動關閉選單
const handleScroll = () => {
  if (isOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})

const setAllSectionsExpanded = (val) => {
  ui.isBuildSummaryExpanded = val
  ui.isPinnedExpanded = val
  ui.isOtherExpanded = val
  ui.isSearchExpanded = val
  closeMenu()
}

const togglePosition = () => {
  ui.fabPosition = ui.fabPosition === 'right' ? 'left' : 'right'
}
</script>

<template>
  <Transition name="fab-fade">
    <div v-show="show" class="dictionary-fab-container" :class="`position-${ui.fabPosition}`">
      <Transition name="menu-slide">
        <div v-if="isOpen" class="fab-menu">
          <div class="fab-menu-item">
            <LocaleToggle @click="closeMenu" />
          </div>
          <div class="fab-menu-item">
            <LangToggle @click="closeMenu" />
          </div>
          <div class="fab-menu-item">
            <ThemeToggle @click="closeMenu" />
          </div>
          <button class="glass-icon-btn fab-item-btn" @click="setAllSectionsExpanded(true)" title="全部展開">
            <ChevronsDown :size="20" />
          </button>
          <button class="glass-icon-btn fab-item-btn" @click="setAllSectionsExpanded(false)" title="全部收合">
            <ChevronsUp :size="20" />
          </button>
          <button class="glass-icon-btn fab-item-btn" @click="togglePosition" title="切換選單位置">
            <ArrowRightLeft :size="20" />
          </button>
        </div>
      </Transition>

      <button class="fab-main-btn" :class="{ 'is-open': isOpen }" @click="toggleMenu" aria-label="懸浮選單">
        <Transition name="icon-spin" mode="out-in">
          <X v-if="isOpen" :size="24" />
          <Settings2 v-else :size="24" />
        </Transition>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.dictionary-fab-container {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  z-index: var(--z-dropdown, 1600);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  pointer-events: none; /* Let clicks pass through empty space */
}

.dictionary-fab-container > * {
  pointer-events: auto; /* Re-enable for visible children */
}

.position-right {
  right: 24px;
}

.position-left {
  left: 24px;
}

.fab-main-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-cyan-bg);
  color: var(--accent-cyan);
  border: 1px solid var(--accent-cyan-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px var(--accent-cyan-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.fab-main-btn:hover {
  transform: scale(1.05);
  background: var(--accent-cyan-bg-strong);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.5), 0 0 20px var(--accent-cyan-border);
}

.fab-main-btn.is-open {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding-bottom: 4px;
}

/* Force inner glass icon buttons to be circular in the FAB menu */
:deep(.glass-icon-btn) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--glass-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:deep(.glass-icon-btn:hover:not(:disabled)) {
  background: var(--surface-hover);
}

.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom center;
}

.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.9);
}

.icon-spin-enter-active,
.icon-spin-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.icon-spin-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}

.icon-spin-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
</style>
