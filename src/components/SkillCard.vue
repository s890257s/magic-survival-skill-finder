<script setup>
import { computed, ref } from 'vue'
import { X, Plus, Pin, AlertTriangle, ChevronDown } from '@lucide/vue'
import { useFavoritesStore } from '@/stores/favorites'
import { usePinnedStore } from '@/stores/pinned'
import { useSettingsStore } from '@/stores/settings'
import GlassCard from '@/components/ui/GlassCard.vue'
import MagicTag from '@/components/ui/MagicTag.vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useSkillActions } from '@/composables/useSkillActions'

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
  // 顯示頂置按鈕（圖鑑頁）
  pinnable: {
    type: Boolean,
    default: false,
  },
  pinOrder: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['select-base', 'select-enchant', 'select-subject'])
const favoritesStore = useFavoritesStore()
const pinnedStore = usePinnedStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()
const { togglePin, toggleFavorite } = useSkillActions(() => props.skill)

const isExpanded = ref(false)
const isFavorite = computed(() => favoritesStore.isFavorite(props.skill.id))
const isPinned = computed(() => pinnedStore.isPinned(props.skill.id))

// 主/副技能欄位設定；副技能帶附魔時會被消耗（遊戲規則）
const formulaParts = computed(() => [
  { labelKey: 'ui.card.mainSkill', part: props.skill.mainSkill, consume: false },
  { labelKey: 'ui.card.subSkill', part: props.skill.subSkill, consume: !!props.skill.subSkill.enchant },
])

const onBaseClick = (name) => {
  if (props.clickableBases) {
    emit('select-base', name)
  }
}

const onEnchantClick = (baseName, enchantName) => {
  if (props.clickableBases) {
    emit('select-enchant', { baseName, enchantName })
  }
}

const onSubjectClick = (subjectName) => {
  if (props.clickableBases) {
    emit('select-subject', subjectName)
  }
}

defineExpose({
  setExpanded: (val) => {
    isExpanded.value = val
  }
})
</script>

<template>
  <GlassCard class="skill-card">
    <div v-if="hasConflict" class="conflict-badge">{{ t('ui.card.conflictBadge') }}</div>
    <div 
      class="skill-header"
      @click="isExpanded = !isExpanded"
      role="button"
      tabindex="0"
      :aria-expanded="isExpanded"
      @keydown.enter="isExpanded = !isExpanded"
      @keydown.space.prevent="isExpanded = !isExpanded"
    >
      <div class="name-area">
        <div class="icon-wrapper">
          <GameIcon :name="skill.name" category="fusion" class="card-fusion-icon" />
          <div v-if="pinOrder > 0" class="pin-order-badge">
            #{{ pinOrder }}
          </div>
        </div>
        <div class="name-text">
          <div class="skill-title-group">
            <div class="skill-name-row">
              <h3 class="skill-name">{{ t(skill.name) }}</h3>
              <span v-if="skill.requirements?.ultimate" class="skill-ultimate-name">→{{ t(skill.requirements.ultimate) }} (Lv100)</span>
            </div>
            <span v-if="settingsStore.showEnglish" class="skill-name-en">{{
              skill.name
            }}</span>
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
          @click.stop="toggleFavorite"
          :class="{ active: isFavorite }"
          :aria-pressed="isFavorite"
          :aria-label="isFavorite ? t('ui.card.removeLabel') : t('ui.card.addLabel')"
        >
          <X
            v-if="isFavorite"
            color="var(--danger)"
            :size="24"
          />
          <Plus
            v-else
            color="var(--text-muted)"
            :size="24"
          />
        </button>
        <div class="expand-icon" :class="{ 'is-expanded': isExpanded }">
          <ChevronDown :size="20" color="var(--text-muted)" />
        </div>
      </div>
    </div>

    <Transition name="expand">
      <div v-show="isExpanded" class="skill-content-wrapper">
        <div class="skill-body">
          <div class="skill-formula">
        <template v-for="(item, index) in formulaParts" :key="item.labelKey">
          <div v-if="index > 0" class="formula-divider">+</div>
          <div class="formula-item">
            <span class="formula-label">
              {{ t(item.labelKey) }}
              <em :class="item.consume ? 'consume' : 'keep'">{{ t(item.consume ? 'ui.card.consume' : 'ui.card.keep') }}</em>
            </span>
            <div class="formula-name-row">
              <GameIcon :name="item.part.name" category="skill" class="card-part-icon" />
              <div class="formula-title-group">
                <div class="base-name-group">
                  <component
                    :is="clickableBases ? 'button' : 'span'"
                    class="formula-value"
                    :class="{
                      clickable: clickableBases,
                      'in-conflict': conflictBases.includes(item.part.name),
                    }"
                    @click="onBaseClick(item.part.name)"
                  >
                    {{ t(item.part.name) }}
                  </component>
                  <span v-if="settingsStore.showEnglish" class="formula-en">{{
                    item.part.name
                  }}</span>
                </div>
                <MagicTag
                  v-if="item.part.enchant"
                  :text="t(item.part.enchant)"
                  :enText="settingsStore.showEnglish ? item.part.enchant : ''"
                  type="primary"
                  :class="{ 'clickable-tag': clickableBases }"
                  @click="onEnchantClick(item.part.name, item.part.enchant)"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="conflictBases.length > 0" class="conflict-detail">
      <AlertTriangle :size="14" />
      <span>{{ t('ui.card.baseConflict', conflictBases.map((b) => t(b)).join('、')) }}</span>
    </div>

    <div class="skill-footer" v-if="skill.requirements?.ultimate">
      <div class="ultimate-area">
        <div class="ultimate-group">
          <span class="part-label invisible" aria-hidden="true">_</span>
          <div class="ultimate-group-content">
            <GameIcon :name="skill.requirements.ultimate" category="ultimate" class="ultimate-icon" />
            <span class="ultimate-text">{{ t('ui.card.ultimateSkill', t(skill.requirements.ultimate)) }}</span>
          </div>
        </div>
        
        <div class="ultimate-group">
          <span class="part-label invisible" aria-hidden="true">_</span>
          <div class="ultimate-group-content">
            <span class="ultimate-operator">=</span>
          </div>
        </div>
        
        <div class="ultimate-group" v-if="skill.requirements.subject">
          <span class="part-label">{{ t('ui.builder.exportSubject') }}</span>
          <div class="ultimate-group-content">
            <MagicTag
              :text="t(skill.requirements.subject)"
              type="secondary"
              :class="{ 'clickable-tag': clickableBases }"
              @click="onSubjectClick(skill.requirements.subject)"
            >
              <template #icon>
                <GameIcon :name="skill.requirements.subject" category="subject" class="card-tiny-icon" />
              </template>
            </MagicTag>
          </div>
        </div>

        <div class="ultimate-group" v-if="skill.requirements.subject && skill.requirements.school">
          <span class="part-label invisible" aria-hidden="true">_</span>
          <div class="ultimate-group-content">
            <span class="ultimate-operator">+</span>
          </div>
        </div>
        
        <div class="ultimate-group" v-if="skill.requirements.school">
          <span class="part-label">{{ t('ui.builder.exportSchool') }}</span>
          <div class="ultimate-group-content">
            <MagicTag
              :text="t(skill.requirements.school)"
              type="primary"
            >
              <template #icon>
                <GameIcon :name="skill.requirements.school" category="school" class="card-tiny-icon" />
              </template>
            </MagicTag>
          </div>
        </div>
      </div>
    </div>
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
  transition: all 0.3s ease;
}

.card-fusion-icon { --icon-size: var(--icon-size-card-fusion); }
.card-part-icon { --icon-size: var(--icon-size-card-part); }
.ultimate-icon { --icon-size: var(--icon-size-card-small); }
.card-tiny-icon { --icon-size: var(--icon-size-card-tiny); }

.conflict-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 2px 8px;
  border-bottom-left-radius: 10px;
  border-top-right-radius: 16px;
  z-index: 10;
  pointer-events: none;
  box-shadow: -2px 2px 8px rgba(0,0,0,0.3);
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

.formula-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
}

.formula-title-group {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 8px;
}

.base-name-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.formula-en {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-style: italic;
  line-height: 1;
  text-align: center;
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
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
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

.skill-body {
  background: var(--inset-bg);
  border-radius: 8px;
  padding: 12px;
}

.skill-formula {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.formula-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.formula-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.formula-label em {
  font-style: normal;
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 4px;
  line-height: 1.5;
}

.formula-label .keep {
  background: var(--accent-cyan-bg);
  color: var(--accent-cyan);
}

.formula-label .consume {
  background: var(--tag-default-bg);
  color: var(--text-muted);
}

.formula-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  text-align: center;
}

.formula-value.clickable {
  cursor: pointer;
  border-bottom: 1px dashed var(--accent-cyan-border);
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.formula-value.clickable:hover {
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-cyan);
}

.formula-value.in-conflict {
  color: var(--danger);
}

.formula-divider {
  font-weight: 700;
  color: var(--text-muted);
  font-size: 1.25rem;
  text-align: center;
  padding: 4px 0;
  line-height: 1;
}

.conflict-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--danger);
  font-size: 0.8rem;
  font-weight: 500;
}

.skill-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.ultimate-area {
  display: flex;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 8px;
  background: var(--inset-bg);
  padding: 8px 12px;
  border-radius: 8px;
  width: 100%;
  overflow-x: auto;
}

.ultimate-area::before,
.ultimate-area::after {
  content: '';
  margin: auto;
}

.ultimate-area::-webkit-scrollbar {
  height: 4px;
}

.ultimate-area::-webkit-scrollbar-track {
  background: transparent;
  margin: 12px;
}

.ultimate-area::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 4px;
  transition: background 0.3s;
}

.ultimate-area:hover::-webkit-scrollbar-thumb {
  background: var(--text-muted);
}

.ultimate-area::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.ultimate-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ultimate-group-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 4px;
}

.part-label {
  font-size: 0.65rem;
  color: var(--text-muted);
  white-space: nowrap;
  line-height: 1;
}

.invisible {
  visibility: hidden;
  user-select: none;
}

.ultimate-icon {
  color: var(--warning);
  flex-shrink: 0;
}

.ultimate-text {
  font-weight: 700;
  color: var(--warning);
  font-size: 0.8rem;
  text-shadow: 0 0 10px rgba(255, 171, 0, 0.3);
  white-space: nowrap;
}

.ultimate-operator {
  color: var(--text-muted);
  font-weight: 700;
  font-size: 0.8rem;
}

.ultimate-area :deep(.magic-tag) {
  padding: 2px 6px;
  font-size: 0.65rem;
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
