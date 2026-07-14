<script setup>
import { ref, computed } from 'vue'
import { Search, Pin, Book, Trash2, Sparkles } from '@lucide/vue'
import { skillsData, skillsById } from '@/data'
import { gameVersion } from '@/data/meta'
import { RESULTS_ANCHOR_ID } from '@/constants/dom'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import SkillCard from '@/components/SkillCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import BottomDock from '@/components/dock/BottomDock.vue'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useFavoritesStore } from '@/stores/favorites'
import { useDictionaryStore } from '@/stores/dictionary'
import { useI18n } from '@/composables/useI18n'
import { useSortableList } from '@/composables/useSortableList'

const pinnedStore = usePinnedStore()
const toastStore = useToastStore()
const favoritesStore = useFavoritesStore()
const dictionaryStore = useDictionaryStore()
const { t } = useI18n()

const filters = dictionaryStore.filters
const ui = dictionaryStore.ui
const { resetAll } = dictionaryStore

// 篩選邏輯在 dictionary store（與 filters 狀態同處）；此處僅取結果
const filteredSkills = computed(() => dictionaryStore.filteredSkills)

// 衝突標記：Map<skillId, conflictBases[]>，一次算完供整個列表使用
const conflictInfo = computed(() => {
  const map = new Map()
  for (const skill of skillsData) {
    const hits = favoritesStore.getConflictingWith(skill)
    if (hits.length > 0) map.set(skill.id, hits.map((h) => h.base))
  }
  return map
})

// --- 反查（點擊卡片上的名稱帶入篩選） ---

const onSelectBase = (name) => {
  if (filters.baseSkill !== name) {
    filters.baseSkill = name
    filters.enchant = ''
  }
}

const onSelectEnchant = ({ baseName, enchantName }) => {
  filters.baseSkill = baseName
  filters.enchant = enchantName
}

const onSelectSubject = (name) => {
  if (filters.subject !== name) {
    filters.subject = name
  }
}

// --- 頂置區 ---

const pinnedInView = computed(() => {
  return pinnedStore.pinnedIds.map((id) => skillsById.get(id)).filter(Boolean)
})

const unpinAll = () => {
  const backup = [...pinnedStore.pinnedIds]
  pinnedStore.clearPins()
  toastStore.showUndoToast(t('ui.dict.unpinnedAllMsg'), t('ui.restore'), () =>
    pinnedStore.setPins(backup),
  )
}

const pinnedListRef = ref(null)
useSortableList(
  pinnedListRef,
  (oldIndex, newIndex) => {
    pinnedStore.reorderVisible(
      pinnedInView.value.map((s) => s.id),
      oldIndex,
      newIndex,
    )
  },
  {
    delay: 200,
    delayOnTouchOnly: true,
    filter: 'button, .pin-btn, .favorite-btn, .formula-value, .magic-tag, .expand-icon',
    preventOnFilter: false,
  },
)

// --- 展開 / 收合 ---

const pinnedCards = ref([])
const allSkillCards = ref([])

const toggleExpandAll = (cards, val) => {
  if (cards && cards.length) {
    cards.forEach((card) => card?.setExpanded?.(val))
  }
}

// --- 清空狀態 ---
const showClearConfirm = ref(false)

const executeClearAll = () => {
  dictionaryStore.resetAll()
  if (favoritesStore.favoriteIds.length > 0) {
    const backup = [...favoritesStore.favoriteIds]
    favoritesStore.clearFavorites()
    toastStore.showUndoToast(t('ui.dict.clearAllSuccessMsg'), t('ui.restore'), () =>
      favoritesStore.setFavorites(backup),
    )
  } else {
    toastStore.showToast(t('ui.dict.clearAllSuccessMsg'), 'success')
  }
}
</script>

<template>
  <div class="dictionary-view">
    <div class="app-header-container">
      <div class="app-header-content">
        <div class="app-header">
          <h1 class="app-title">
            {{ t('ui.magicSurvival') }}
            <span class="version-tag">v{{ gameVersion }}</span>
          </h1>
        </div>
        <div class="header-actions-row">
          <button class="glass-icon-btn" @click="showClearConfirm = true" :title="t('ui.dict.clearAll')">
            <Trash2 :size="20" />
          </button>
          <HeaderActions />
        </div>
      </div>
      <hr class="header-divider" />
    </div>

    <div class="list-area">
      <!-- 頂置技能區 -->
      <div class="section-container">
        <SectionHeader
          :expanded="ui.isPinnedExpanded"
          :count="pinnedStore.pinnedIds.length"
          @toggle="ui.isPinnedExpanded = !ui.isPinnedExpanded"
        >
          <template #icon><Pin :size="18" /></template>
          {{ t('ui.dict.pinnedSkills') }}
          <template #actions>
            <template v-if="ui.isPinnedExpanded">
              <button class="text-action danger" @click.stop="unpinAll" :disabled="pinnedInView.length === 0">
                {{ t('ui.dict.unpinAll') }}
              </button>
              <div class="action-divider"></div>
              <button class="text-action" @click.stop="toggleExpandAll(pinnedCards, true)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.expandSkills') }}</button>
              <button class="text-action" @click.stop="toggleExpandAll(pinnedCards, false)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.collapseSkills') }}</button>
              <div class="action-divider"></div>
            </template>
          </template>
        </SectionHeader>

        <div v-show="ui.isPinnedExpanded">
          <div v-if="pinnedInView.length === 0" class="section-empty-state">
            {{ t('ui.dict.emptyPinned') }}
          </div>
          <div v-else ref="pinnedListRef" class="skill-list pinned-list">
            <SkillCard
              v-for="(skill, index) in pinnedInView"
              :key="skill.id"
              ref="pinnedCards"
              :data-id="skill.id"
              :skill="skill"
              :hasConflict="conflictInfo.has(skill.id)"
              :conflictBases="conflictInfo.get(skill.id)"
              clickableBases
              pinnable
              :pinOrder="index + 1"
              @select-base="onSelectBase"
              @select-enchant="onSelectEnchant"
              @select-subject="onSelectSubject"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="list-area" :id="RESULTS_ANCHOR_ID">
      <!-- Main Content Empty State (Filters) -->
      <EmptyState
        v-if="filteredSkills.length === 0"
        :text="t('ui.dict.noResults')"
        :showAction="dictionaryStore.hasAnyFilters"
        :actionText="t('ui.resetSearchAndFilter')"
        @action="resetAll"
      >
        <template #icon>
          <Search :size="48" />
        </template>
      </EmptyState>

      <!-- Results (Other Skills) -->
      <div class="results-area" v-else>
        <!-- Section 3: Other Skills -->
        <div class="section-container">
          <SectionHeader
            :expanded="ui.isOtherExpanded"
            :count="filteredSkills.length"
            @toggle="ui.isOtherExpanded = !ui.isOtherExpanded"
          >
            <template #icon><Book :size="18" /></template>
            {{ t('ui.dict.allSkills') }}
            <template #actions>
              <template v-if="ui.isOtherExpanded">
                <button class="text-action" @click.stop="toggleExpandAll(allSkillCards, true)" :disabled="filteredSkills.length === 0">{{ t('ui.dict.expandSkills') }}</button>
                <button class="text-action" @click.stop="toggleExpandAll(allSkillCards, false)" :disabled="filteredSkills.length === 0">{{ t('ui.dict.collapseSkills') }}</button>
                <div class="action-divider"></div>
              </template>
            </template>
          </SectionHeader>

          <div v-show="ui.isOtherExpanded">
            <div v-if="filteredSkills.length > 0" class="skill-list unpinned-list">
              <SkillCard
                v-for="skill in filteredSkills"
                :key="skill.id"
                ref="allSkillCards"
                :data-id="skill.id"
                :skill="skill"
                :hasConflict="conflictInfo.has(skill.id)"
                :conflictBases="conflictInfo.get(skill.id)"
                clickableBases
                pinnable
                @select-base="onSelectBase"
                @select-enchant="onSelectEnchant"
                @select-subject="onSelectSubject"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 dock：搜尋 / 配技 雙 tab 抽屜 -->
    <BottomDock />

    <ConfirmDialog
      v-model:show="showClearConfirm"
      :title="t('ui.dict.clearAllTitle')"
      :confirmText="t('ui.confirm')"
      :cancelText="t('ui.cancel')"
      variant="danger"
      @confirm="executeClearAll"
    >
      <p>{{ t('ui.dict.clearAllConfirmMsg') }}</p>
      <ul class="clear-confirm-list">
        <li><Search :size="16" style="color: var(--accent-cyan)" /> {{ t('ui.dict.searchTitle') }}</li>
        <li><Sparkles :size="16" style="color: var(--accent-purple)" /> {{ t('ui.builder.summaryTitle') }}</li>
      </ul>
    </ConfirmDialog>
  </div>
</template>

<style scoped>
.dictionary-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  /* 留給底部 dock tab 列的空間 */
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
}

.app-header-container {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
}

.app-header-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 768px) {
  .app-header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .header-actions-row {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.app-header {
  display: flex;
  align-items: center;
}

.header-actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.header-divider {
  border: 0;
  height: 1px;
  background: var(--glass-border);
  margin: 16px 0;
}

.app-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: var(--name-glow);
}

.version-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid var(--accent-cyan-border);
  box-shadow: 0 0 10px var(--accent-cyan-glow);
  letter-spacing: 0.5px;
}

.list-area {
  scroll-margin-top: 8px;
}

.section-container {
  margin-bottom: 24px;
}

/* 基底樣式在全域 .section-empty-state（main.css），此處只放本頁差異 */
.section-empty-state {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 0 16px;
}

.skill-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.results-area {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .skill-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

.clear-confirm-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--text-secondary);
}
.clear-confirm-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--glass-bg);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--glass-border);
}
</style>
