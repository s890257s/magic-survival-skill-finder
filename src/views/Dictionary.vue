<script setup>
import { ref, computed } from 'vue'
import { Search, Pin, ChevronsUp, ChevronsDown, Book } from '@lucide/vue'
import { skillsData } from '@/data'
import { gameVersion } from '@/data/meta'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import SkillCard from '@/components/SkillCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import BuildSection from '@/components/builder/BuildSection.vue'
import DictionaryTopBar from '@/components/dictionary/DictionaryTopBar.vue'
import DictionaryFab from '@/components/dictionary/DictionaryFab.vue'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useFavoritesStore } from '@/stores/favorites'
import { useDictionaryStore } from '@/stores/dictionary'
import { useI18n } from '@/composables/useI18n'
import { useSortableList } from '@/composables/useSortableList'
import { onMounted, onUnmounted } from 'vue'

const pinnedStore = usePinnedStore()
const toastStore = useToastStore()
const favoritesStore = useFavoritesStore()
const dictionaryStore = useDictionaryStore()
const { t } = useI18n()

const filters = dictionaryStore.filters
const ui = dictionaryStore.ui
const { resetAll } = dictionaryStore

const showFab = ref(false)
const handleScroll = () => {
  showFab.value = window.scrollY > 120
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// --- 篩選 ---

const filteredSkills = computed(() => {
  const searchTerms = [...filters.searchTags, filters.search.trim()]
    .filter(Boolean)
    .map((term) => term.toLowerCase())

  return skillsData.filter((skill) => {
    if (searchTerms.some((q) => !skill.searchText.includes(q))) return false

    // 學派篩選：等待遊戲學派資料補齊，暫時停用
    if (
      filters.school &&
      skill.requirements?.school &&
      skill.requirements.school !== filters.school
    ) {
      return false
    }
    if (filters.subject && skill.requirements?.subject !== filters.subject) {
      return false
    }
    if (filters.baseSkill) {
      const matchMain = skill.mainSkill?.name === filters.baseSkill
      const matchSub = skill.subSkill?.name === filters.baseSkill
      if (!matchMain && !matchSub) return false

      if (filters.enchant) {
        let enchantMatched = false
        if (matchMain && skill.mainSkill?.enchant === filters.enchant) enchantMatched = true
        if (matchSub && skill.subSkill?.enchant === filters.enchant) enchantMatched = true
        if (!enchantMatched) return false
      }
    }
    if (filters.ultimate && !skill.requirements?.ultimate) {
      return false
    }
    if (filters.excludeConsumed) {
      const main = skill.mainSkill?.name
      const sub = skill.subSkill?.name
      const usedBases = favoritesStore.favoriteBaseUsage
      if ((main && usedBases.has(main)) || (sub && usedBases.has(sub))) {
        return false
      }
    }
    return true
  })
})

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
  return pinnedStore.pinnedIds
    .map((id) => skillsData.find((s) => s.id === id))
    .filter(Boolean)
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
    // 以可見清單算出新順序，再回寫到完整 pinnedIds（保留失效 id 的位置）
    const visible = pinnedInView.value
    const visibleIds = visible.map((s) => s.id)
    const moved = visibleIds.splice(oldIndex, 1)[0]
    visibleIds.splice(newIndex, 0, moved)

    const newPins = []
    let visiblePtr = 0
    for (const id of pinnedStore.pinnedIds) {
      if (visible.some((s) => s.id === id)) {
        newPins.push(visibleIds[visiblePtr])
        visiblePtr++
      } else {
        newPins.push(id)
      }
    }
    pinnedStore.setPins(newPins)
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

const setAllSectionsExpanded = (val) => {
  ui.isBuildSummaryExpanded = val
  ui.isPinnedExpanded = val
  ui.isOtherExpanded = val
  ui.isSearchExpanded = val
}

const toggleExpandAll = (cards, val) => {
  if (cards && cards.length) {
    cards.forEach((card) => card?.setExpanded?.(val))
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
          <HeaderActions />

          <div class="action-divider global-divider"></div>

          <button class="btn-icon-rounded global-collapse-btn" @click="setAllSectionsExpanded(true)" :title="t('ui.expandAll')">
            <ChevronsDown :size="20" />
          </button>
          <button class="btn-icon-rounded global-collapse-btn" @click="setAllSectionsExpanded(false)" :title="t('ui.collapseAll')">
            <ChevronsUp :size="20" />
          </button>
        </div>
      </div>
      <hr class="header-divider" />
    </div>

    <div class="list-area">
      <!-- Section 1: Build Summary -->
      <BuildSection />

      <!-- Section 2: Pinned Skills -->
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
              <button class="btn-text danger" @click.stop="unpinAll" :disabled="pinnedInView.length === 0">
                {{ t('ui.dict.unpinAll') }}
              </button>
              <div class="action-divider"></div>
              <button class="btn-text" @click.stop="toggleExpandAll(pinnedCards, true)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.expandSkills') }}</button>
              <button class="btn-text" @click.stop="toggleExpandAll(pinnedCards, false)" :disabled="pinnedInView.length === 0">{{ t('ui.dict.collapseSkills') }}</button>
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

    <!-- DictionaryTopBar -->
    <DictionaryTopBar :resultCount="filteredSkills.length" />

    <div class="list-area">
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
                <button class="btn-text" @click.stop="toggleExpandAll(allSkillCards, true)" :disabled="filteredSkills.length === 0">{{ t('ui.dict.expandSkills') }}</button>
                <button class="btn-text" @click.stop="toggleExpandAll(allSkillCards, false)" :disabled="filteredSkills.length === 0">{{ t('ui.dict.collapseSkills') }}</button>
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

    <!-- 浮動按鈕選單 -->
    <DictionaryFab :show="showFab" />
  </div>
</template>

<style scoped>
.dictionary-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
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

.global-collapse-btn {
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.global-collapse-btn:hover {
  background: var(--glass-border);
  color: var(--text-primary);
}

.action-divider {
  width: 1px;
  height: 14px;
  background: var(--glass-border);
}

.global-divider {
  margin: 0 4px;
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
  scroll-margin-top: 96px;
}

.section-container {
  margin-bottom: 24px;
}

.section-empty-state {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
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
</style>
