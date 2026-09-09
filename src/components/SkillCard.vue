<script setup>
import { computed, ref } from 'vue'
import { X, Plus, Pin, AlertTriangle, ChevronDown } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { usePinnedStore } from '@/stores/pinned'
import { useSettingsStore } from '@/stores/settings'
import GlassCard from '@/components/ui/GlassCard.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import SkillFormula from '@/components/skill-card/SkillFormula.vue'
import UltimateRecipe from '@/components/skill-card/UltimateRecipe.vue'
import { useI18n } from '@/composables/useI18n'
import { useSkillActions } from '@/composables/useSkillActions'
import { gameVersion } from '@/data/meta'

const props = defineProps({
  skill: {
    type: Object,
    required: true,
  },
  hasConflict: {
    type: Boolean,
    default: false,
  },
  // 該技能中與配技其他技能重複的基礎技能名稱
  conflictBases: {
    type: Array,
    default: () => [],
  },
  // 主/副技能名稱可點擊反查
  clickableBases: {
    type: Boolean,
    default: false,
  },
  // 顯示釘選按鈕（圖鑑頁）
  pinnable: {
    type: Boolean,
    default: false,
  },
  pinOrder: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['select-base', 'select-enchant', 'select-subject', 'toggled'])
const favoritesStore = useFavoritesStore()
const pinnedStore = usePinnedStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const { togglePin, toggleFavorite } = useSkillActions(() => props.skill)

const isExpanded = ref(false)
const isFavorite = computed(() => favoritesStore.isFavorite(props.skill.id))
const isPinned = computed(() => pinnedStore.isPinned(props.skill.id))
const isNew = computed(
  () =>
    props.skill.addedVersion === gameVersion ||
    props.skill.requirements?.addedVersion === gameVersion,
)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  emit('toggled', isExpanded.value)
}

defineExpose({
  setExpanded: (val) => {
    isExpanded.value = val
  },
})
</script>

<template>
  <GlassCard class="skill-card">
    <div class="top-right-badges" v-if="isNew || hasConflict">
      <div v-if="isNew" class="new-card-badge">{{ props.skill.requirements.addedVersion }} NEW</div>
      <div v-if="hasConflict" class="conflict-badge">{{ t('ui.card.conflictBadge') }}</div>
    </div>
    <div
      class="skill-header"
      @click="toggleExpand"
      role="button"
      tabindex="0"
      :aria-expanded="isExpanded"
      @keydown.enter="toggleExpand"
      @keydown.space.prevent="toggleExpand"
    >
      <div class="name-area">
        <div class="icon-wrapper">
          <GameIcon :name="skill.name" category="fusion" class="card-fusion-icon" />
          <div v-if="pinOrder > 0" class="pin-order-badge">#{{ pinOrder }}</div>
        </div>
        <div class="name-text">
          <div class="skill-title-group">
            <div class="skill-name-row">
              <h3 class="skill-name">{{ t(skill.name) }}</h3>
              <template v-if="skill.requirements?.ultimate">
                <span class="skill-ultimate-name"
                  >→{{ t(skill.requirements.ultimate)
                  }}{{
                    skill.requirements.subject ? ` (${t(skill.requirements.subject)})` : ''
                  }}
                  (Lv100)</span
                >
              </template>
            </div>
            <span v-if="settingsStore.showEnglish" class="skill-name-en">{{ skill.name }}</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button
          v-if="pinnable"
          class="pin-btn"
          @click.stop="togglePin"
          :class="{ active: isPinned }"
          :aria-pressed="isPinned"
          :aria-label="isPinned ? t('ui.card.unpinLabel') : t('ui.card.pinLabel')"
        >
          <Pin
            :fill="isPinned ? 'var(--accent-cyan)' : 'none'"
            :color="isPinned ? 'var(--accent-cyan)' : 'var(--text-muted)'"
            :size="20"
          />
        </button>
        <button
          class="favorite-btn"
          @click.stop="toggleFavorite($event)"
          :class="{ active: isFavorite }"
          :aria-pressed="isFavorite"
          :aria-label="isFavorite ? t('ui.card.removeLabel') : t('ui.card.addLabel')"
        >
          <X v-if="isFavorite" color="var(--danger)" :size="24" />
          <Plus v-else color="var(--text-muted)" :size="24" />
        </button>
        <div class="expand-icon" :class="{ 'is-expanded': isExpanded }">
          <ChevronDown :size="20" color="var(--text-muted)" />
        </div>
      </div>
    </div>

    <Transition name="expand">
      <div v-show="isExpanded" class="skill-content-wrapper">
        <SkillFormula
          :skill="skill"
          :clickableBases="clickableBases"
          :conflictBases="conflictBases"
          @select-base="emit('select-base', $event)"
          @select-enchant="emit('select-enchant', $event)"
        />

        <div v-if="conflictBases.length > 0" class="conflict-detail">
          <AlertTriangle :size="14" />
          <span>{{ t('ui.card.baseConflict', conflictBases.map((b) => t(b)).join('、')) }}</span>
        </div>

        <UltimateRecipe
          v-if="skill.requirements?.ultimate"
          :requirements="skill.requirements"
          :clickable="clickableBases"
          @select-subject="emit('select-subject', $event)"
        />
      </div>
    </Transition>
  </GlassCard>
</template>

<style scoped>
.skill-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card-fusion-icon {
  --icon-size: var(--icon-size-card-fusion);
}

.top-right-badges {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  z-index: 10;
  pointer-events: none;
  border-bottom-left-radius: 10px;
  border-top-right-radius: 16px;
  overflow: hidden;
  box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.3);
}

.new-card-badge {
  background-color: var(--info, #ffab00);
  color: black;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  letter-spacing: 0.5px;
}

.conflict-badge {
  background-color: var(--danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}

.skill-header:hover {
  opacity: 0.85;
}

.name-area {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.icon-wrapper {
  position: relative;
  display: flex;
  flex-shrink: 0;
}

.name-text {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.skill-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.skill-name {
  font-size: 1.25rem;
  margin: 0;
  text-shadow: var(--name-glow);
  line-height: 1.2;
}

.skill-name-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}

.skill-ultimate-name {
  font-size: 0.75rem;
  color: var(--warning);
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 171, 0, 0.3);
}

.skill-name-en {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.pin-order-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--accent-cyan);
  background: var(--bg-primary, #1e1e2e);
  padding: 2px 6px;
  border-radius: 12px;
  border: 1px solid var(--accent-cyan-border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  margin-left: 4px;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

.skill-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.favorite-btn,
.pin-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 8px;
  border-radius: 50%;
  outline: none;
}

.favorite-btn:hover,
.pin-btn:hover {
  transform: scale(1.15);
}

.favorite-btn:active,
.pin-btn:active {
  transform: scale(0.95);
}

.favorite-btn.active,
.pin-btn.active {
  animation: heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.conflict-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 500;
}

:deep(.clickable-tag) {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

:deep(.clickable-tag:hover) {
  transform: translateY(-2px);
  filter: brightness(1.15);
}
</style>
