<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Sparkles, AlertTriangle, ArrowUpToLine } from '@lucide/vue'
import SearchPanel from '@/components/dictionary/SearchPanel.vue'
import BuildPanel from '@/components/builder/BuildPanel.vue'
import { useDictionaryStore } from '@/stores/dictionary'
import { useFavoritesStore } from '@/stores/favorites'
import { useI18n } from '@/composables/useI18n'
import { useBodyScrollLock, hasOpenOverlay } from '@/composables/useOverlays'

const { t } = useI18n()
const dictionaryStore = useDictionaryStore()
const favoritesStore = useFavoritesStore()
const ui = dictionaryStore.ui

const resultCount = computed(() => dictionaryStore.filteredSkills.length)

// 收合時點 tab → 展開該面板；展開時點另一 tab → 切換；點當前 tab → 收合
const onTabClick = (tab) => {
  if (ui.isDockExpanded && ui.dockTab === tab) {
    ui.isDockExpanded = false
  } else {
    ui.dockTab = tab
    ui.isDockExpanded = true
  }
}

const collapse = () => {
  ui.isDockExpanded = false
}

const onKeydown = (e) => {
  if (e.key !== 'Escape' || !ui.isDockExpanded) return
  // 有更上層浮層（modal / dropdown）開著時，Esc 讓它們先關，dock 不動
  if (hasOpenOverlay()) return
  collapse()
}

// 展開時鎖背景捲動（計數式，與 Modal 共用，互不覆蓋）
useBodyScrollLock(() => ui.isDockExpanded)

// 回頂部小鈕：捲動超過約一屏才浮現
const showTopBtn = ref(false)
const onScroll = () => {
  showTopBtn.value = window.scrollY > 400
}
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <!-- Scrim -->
  <Transition name="scrim-fade">
    <div v-show="ui.isDockExpanded" class="dock-scrim" @click="collapse"></div>
  </Transition>

  <!-- 回頂部小鈕 -->
  <Transition name="top-btn-fade">
    <button
      v-show="showTopBtn && !ui.isDockExpanded"
      class="top-btn"
      @click="scrollToTop"
      :title="t('ui.backToTop')"
      :aria-label="t('ui.backToTop')"
    >
      <ArrowUpToLine :size="18" />
    </button>
  </Transition>

  <div class="bottom-dock" :class="{ 'is-expanded': ui.isDockExpanded }">
    <!-- 面板 -->
    <Transition name="panel-slide">
      <div v-show="ui.isDockExpanded" class="dock-panel">
        <div class="panel-inner">
          <SearchPanel v-show="ui.dockTab === 'search'" />
          <BuildPanel v-show="ui.dockTab === 'build'" />
        </div>
      </div>
    </Transition>

    <!-- Tab 列 -->
    <div class="dock-tabbar" role="tablist">
      <button
        class="dock-tab"
        :class="{ 'is-active': ui.isDockExpanded && ui.dockTab === 'search' }"
        role="tab"
        :aria-selected="ui.dockTab === 'search'"
        :aria-expanded="ui.isDockExpanded && ui.dockTab === 'search'"
        @click="onTabClick('search')"
      >
        <Search :size="18" class="tab-icon tab-icon--search" />
        <span class="tab-label">{{ t('ui.dict.searchTitle') }}</span>
        <span class="tab-badge">{{ resultCount }}</span>
        <span v-if="dictionaryStore.hasAnyFilters" class="filter-dot" :title="t('ui.clearAll')"></span>
      </button>

      <div class="tab-divider"></div>

      <button
        class="dock-tab"
        :class="{ 'is-active': ui.isDockExpanded && ui.dockTab === 'build' }"
        role="tab"
        :aria-selected="ui.dockTab === 'build'"
        :aria-expanded="ui.isDockExpanded && ui.dockTab === 'build'"
        @click="onTabClick('build')"
      >
        <Sparkles :size="18" class="tab-icon tab-icon--build" />
        <span class="tab-label">{{ t('ui.builder.summaryTitle') }}</span>
        <span class="tab-badge" :class="{ 'is-over-limit': favoritesStore.isOverLimit }">
          {{ favoritesStore.favoriteSkills.length }}/{{ favoritesStore.maxSlots }}
        </span>
        <AlertTriangle
          v-if="favoritesStore.conflicts.size > 0"
          :size="14"
          class="conflict-icon"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
.dock-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  /* 低於 dock（--z-bottom-nav: 1000）、高於內容 */
  z-index: 999;
}

.bottom-dock {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 900px;
  z-index: var(--z-bottom-nav, 1000);
  display: flex;
  flex-direction: column;
}

/* 兩個 tab 面板統一固定高度：切換 tab 時面板上緣不跳動。
   高度以搜尋面板的鍵盤約束為基準（輸入框需落在螢幕上緣，虛擬鍵盤蓋不到） */
.dock-panel {
  height: calc(85vh - 60px);
  height: calc(85dvh - 60px);
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-bottom: none;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.panel-inner {
  overflow-y: auto;
  height: 100%;
}

.panel-inner::-webkit-scrollbar {
  width: 6px;
}
.panel-inner::-webkit-scrollbar-track {
  background: transparent;
}
.panel-inner::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 3px;
}

.dock-tabbar {
  display: flex;
  align-items: stretch;
  background: var(--bg-surface);
  border-top: 1px solid var(--glass-border);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25);
}

/* 面板收合時 tab 列自帶圓角；展開時由面板接手 */
.bottom-dock:not(.is-expanded) .dock-tabbar {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.dock-tab {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 60px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.dock-tab:hover {
  background: rgba(255, 255, 255, 0.04);
}

.dock-tab.is-active {
  color: var(--text-primary);
}

.dock-tab.is-active .tab-icon--search {
  color: var(--accent-cyan);
}

.tab-icon--build {
  color: var(--accent-purple);
}

.tab-icon--search {
  color: var(--accent-cyan);
}

.tab-badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tab-badge.is-over-limit {
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px solid var(--warning-border);
}

.filter-dot {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-cyan);
  box-shadow: 0 0 6px var(--accent-cyan-glow);
}

.conflict-icon {
  color: var(--danger);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.tab-divider {
  width: 1px;
  background: var(--glass-border);
  margin: 12px 0;
}

.top-btn {
  position: fixed;
  right: 16px;
  bottom: calc(76px + env(safe-area-inset-bottom));
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 998;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: color 0.2s, background 0.2s;
}

.top-btn:hover {
  color: var(--text-primary);
  background: var(--surface-hover, var(--glass-border));
}

.scrim-fade-enter-active,
.scrim-fade-leave-active {
  transition: opacity 0.25s ease;
}

.scrim-fade-enter-from,
.scrim-fade-leave-to {
  opacity: 0;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

.top-btn-fade-enter-active,
.top-btn-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.top-btn-fade-enter-from,
.top-btn-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
