<script setup>
import { ref, computed } from 'vue'
import { Search, Pin, Book, Sparkles } from '@lucide/vue'
import { skillsData, skillsById } from '@/data'
import { RESULTS_ANCHOR_ID } from '@/constants/dom'
import AppHeader from '@/components/layout/AppHeader.vue'
import SkillCard from '@/components/SkillCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ExpandCollapseActions from '@/components/dictionary/ExpandCollapseActions.vue'
import BottomDock from '@/components/dock/BottomDock.vue'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useFavoritesStore } from '@/stores/favorites'
import { useDictionaryStore } from '@/stores/dictionary'
import { useI18n } from '@/composables/useI18n'
import { useSortableList } from '@/composables/useSortableList'
import { isDesktopWidth } from '@/utils/device'

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
    if (hits.length > 0)
      map.set(
        skill.id,
        hits.map((h) => h.base),
      )
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

// --- 釘選區 ---

const pinnedInView = computed(() => {
  return pinnedStore.pinnedIds.map((id) => skillsById.get(id)).filter(Boolean)
})

const unpinAll = () => {
  const backup = [...pinnedStore.pinnedIds]
  pinnedStore.clearPins()
  toastStore.showUndoToast(t('ui.dict.unpinnedAllMsg'), () => pinnedStore.setPins(backup))
}

const pinnedListRef = ref(null)
useSortableList(
  pinnedListRef,
  (oldIndex, newIndex) => {
    pinnedStore.reorderPins(
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

const allListRef = ref(null)

// v-for 的 ref 陣列不保證與資料順序一致，改以 Map<skillId, exposed> 收集
const pinnedCardRefs = new Map()
const allCardRefs = new Map()

const setCardRef = (refMap, id) => (card) => {
  if (card) {
    refMap.set(id, card)
  } else {
    refMap.delete(id)
  }
}

const toggleExpandAll = (refMap, val) => {
  refMap.forEach((card) => card.setExpanded(val))
}

// 桌機多欄佈局：展開單張卡片時，同一列的卡片一起連動，避免列高參差
const onCardToggled = (index, val, listType) => {
  if (!isDesktopWidth()) return

  const isPinned = listType === 'pinned'
  const listEl = isPinned ? pinnedListRef.value : allListRef.value
  if (!listEl) return

  // 欄數取自 CSS grid 的實際渲染結果
  const columns = window.getComputedStyle(listEl).gridTemplateColumns.split(' ').length
  if (columns <= 1) return

  const startIndex = Math.floor(index / columns) * columns
  const endIndex = startIndex + columns

  const sourceArray = isPinned ? pinnedInView.value : filteredSkills.value
  const refMap = isPinned ? pinnedCardRefs : allCardRefs
  for (let i = startIndex; i < endIndex && i < sourceArray.length; i++) {
    refMap.get(sourceArray[i].id)?.setExpanded(val)
  }
}

// --- 清空狀態 ---

const showClearConfirm = ref(false)

const executeClearAll = () => {
  dictionaryStore.resetAll()
  if (favoritesStore.favoriteIds.length > 0) {
    const backup = [...favoritesStore.favoriteIds]
    favoritesStore.clearFavorites()
    toastStore.showUndoToast(t('ui.dict.clearAllSuccessMsg'), () =>
      favoritesStore.setFavorites(backup),
    )
  } else {
    toastStore.showToast(t('ui.dict.clearAllSuccessMsg'), 'success', { prefKey: 'general' })
  }
}
</script>

<template>
  <div class="dictionary-view">
    <AppHeader @clear="showClearConfirm = true" />

    <div class="list-area">
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
              <button
                class="header-action-btn danger"
                @click.stop="unpinAll"
                :disabled="pinnedInView.length === 0"
              >
                {{ t('ui.dict.unpinAll') }}
              </button>
              <div class="action-divider"></div>
              <ExpandCollapseActions
                :disabled="pinnedInView.length === 0"
                @expand-all="toggleExpandAll(pinnedCardRefs, true)"
                @collapse-all="toggleExpandAll(pinnedCardRefs, false)"
              />
            </template>
          </template>
        </SectionHeader>

        <div v-show="ui.isPinnedExpanded">
          <div v-if="pinnedInView.length === 0" class="section-empty-state">
            {{ t('ui.dict.emptyPinned') }}
          </div>
          <div v-else ref="pinnedListRef" class="skill-list">
            <SkillCard
              v-for="(skill, index) in pinnedInView"
              :key="skill.id"
              :ref="setCardRef(pinnedCardRefs, skill.id)"
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
              @toggled="(val) => onCardToggled(index, val, 'pinned')"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="list-area" :id="RESULTS_ANCHOR_ID">
      <div class="section-container">
        <SectionHeader
          :expanded="ui.isOtherExpanded"
          :count="filteredSkills.length"
          @toggle="ui.isOtherExpanded = !ui.isOtherExpanded"
        >
          <template #icon><Book :size="18" /></template>
          {{ t('ui.dict.allSkills') }}
          <template #actions>
            <ExpandCollapseActions
              v-if="ui.isOtherExpanded"
              :disabled="filteredSkills.length === 0"
              @expand-all="toggleExpandAll(allCardRefs, true)"
              @collapse-all="toggleExpandAll(allCardRefs, false)"
            />
          </template>
        </SectionHeader>

        <div v-show="ui.isOtherExpanded">
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

          <div v-else ref="allListRef" class="skill-list">
            <SkillCard
              v-for="(skill, index) in filteredSkills"
              :key="skill.id"
              :ref="setCardRef(allCardRefs, skill.id)"
              :data-id="skill.id"
              :skill="skill"
              :hasConflict="conflictInfo.has(skill.id)"
              :conflictBases="conflictInfo.get(skill.id)"
              clickableBases
              pinnable
              @select-base="onSelectBase"
              @select-enchant="onSelectEnchant"
              @select-subject="onSelectSubject"
              @toggled="(val) => onCardToggled(index, val, 'all')"
            />
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
        <li>
          <Search :size="16" style="color: var(--accent-cyan)" /> {{ t('ui.dict.searchTitle') }}
        </li>
        <li>
          <Sparkles :size="16" style="color: var(--accent-purple)" />
          {{ t('ui.builder.summaryTitle') }}
        </li>
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

/* 取消全部釘選鈕（danger 變體）；一般展開/收合鈕在 ExpandCollapseActions */
.header-action-btn {
  background: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 12px;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: var(--danger);
  border-color: rgba(255, 82, 82, 0.3);
}

/* 放大隱形點擊區（向上下補齊 SectionHeader 的 padding） */
.header-action-btn::after {
  content: '';
  position: absolute;
  top: -12px;
  bottom: -12px;
  left: -4px;
  right: -4px;
}

.header-action-btn:hover:not(:disabled) {
  background: rgba(255, 82, 82, 0.1);
  color: var(--danger-hover);
  border-color: var(--danger);
}

.header-action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: transparent;
}

@media (max-width: 767px) {
  .header-action-btn {
    flex: 1;
    padding: 6px 4px;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* 手機版按鈕均分，不需要分隔線 */
  .action-divider {
    display: none;
  }
}
</style>
