<script setup>
import { computed } from 'vue'
import { Heart, AlertTriangle, ChevronUp, ChevronDown, Crown } from '@lucide/vue'
import { useFavoritesStore, MAX_SLOTS } from '../stores/favorites'
import { useToastStore } from '../stores/toast'
import GlassCard from './ui/GlassCard.vue'
import MagicTag from './ui/MagicTag.vue'

const props = defineProps({
  skill: {
    type: Object,
    required: true
  },
  hasConflict: {
    type: Boolean,
    default: false
  },
  // 該技能中與配裝其他技能重複的基礎技能名稱
  conflictBases: {
    type: Array,
    default: () => []
  },
  // 主/副技能名稱可點擊反查
  clickableBases: {
    type: Boolean,
    default: false
  },
  // 顯示排序按鈕（配裝頁）
  reorderable: {
    type: Boolean,
    default: false
  },
  isFirst: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select-base', 'move'])

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()
const isFavorite = computed(() => favoritesStore.isFavorite(props.skill.id))

const toggle = () => {
  if (isFavorite.value) {
    favoritesStore.toggleFavorite(props.skill.id)
    toastStore.showToast(`已將「${props.skill.name}」移出配裝`, 'info')
    return
  }

  const hits = favoritesStore.getConflictingWith(props.skill)
  favoritesStore.toggleFavorite(props.skill.id)

  if (hits.length > 0) {
    const detail = hits.map(h => `「${h.base}」與『${h.skillName}』`).join('、')
    toastStore.showToast(`已加入，但 ${detail} 衝突`, 'warning', { duration: 4500 })
  } else if (favoritesStore.isOverLimit) {
    toastStore.showToast(`已加入配裝（${favoritesStore.count}/${MAX_SLOTS}，超過常規上限）`, 'warning')
  } else {
    toastStore.showToast(`已將「${props.skill.name}」加入配裝（${favoritesStore.count}/${MAX_SLOTS}）`, 'success')
  }
}

const onBaseClick = (name) => {
  if (props.clickableBases) {
    emit('select-base', name)
  }
}
</script>

<template>
  <GlassCard class="skill-card" :class="{ 'is-conflict': hasConflict }">
    <div class="skill-header">
      <div class="name-area">
        <h3 class="skill-name">{{ skill.name }}</h3>
        <MagicTag v-if="skill.requirements?.subject" :text="skill.requirements.subject" type="secondary" />
      </div>
      <div class="header-actions">
        <div v-if="reorderable" class="reorder-group">
          <button
            class="reorder-btn"
            :disabled="isFirst"
            @click="emit('move', -1)"
            aria-label="上移"
          >
            <ChevronUp :size="18" />
          </button>
          <button
            class="reorder-btn"
            :disabled="isLast"
            @click="emit('move', 1)"
            aria-label="下移"
          >
            <ChevronDown :size="18" />
          </button>
        </div>
        <button class="favorite-btn" @click="toggle" :class="{ active: isFavorite }" aria-label="加入或移出配裝">
          <Heart
            :fill="isFavorite ? 'var(--accent-purple)' : 'none'"
            :color="isFavorite ? 'var(--accent-purple)' : 'var(--text-muted)'"
            :size="24"
          />
        </button>
      </div>
    </div>

    <div class="skill-body">
      <div class="skill-formula">
        <div class="formula-item">
          <span class="formula-label">主技能 <em class="keep">保留</em></span>
          <component
            :is="clickableBases ? 'button' : 'span'"
            class="formula-value"
            :class="{ clickable: clickableBases, 'in-conflict': conflictBases.includes(skill.mainSkill.name) }"
            @click="onBaseClick(skill.mainSkill.name)"
          >
            {{ skill.mainSkill.name }}
          </component>
          <MagicTag v-if="skill.mainSkill.enchant" :text="skill.mainSkill.enchant" type="primary" />
        </div>
        <div class="formula-divider">+</div>
        <div class="formula-item">
          <span class="formula-label">副技能 <em class="consume">消耗</em></span>
          <component
            :is="clickableBases ? 'button' : 'span'"
            class="formula-value"
            :class="{ clickable: clickableBases, 'in-conflict': conflictBases.includes(skill.subSkill.name) }"
            @click="onBaseClick(skill.subSkill.name)"
          >
            {{ skill.subSkill.name }}
          </component>
          <MagicTag v-if="skill.subSkill.enchant" :text="skill.subSkill.enchant" type="primary" />
        </div>
      </div>
    </div>

    <div v-if="conflictBases.length > 0" class="conflict-detail">
      <AlertTriangle :size="14" />
      <span>基礎技能重複：{{ conflictBases.join('、') }}</span>
    </div>

    <div class="skill-footer" v-if="skill.requirements?.ultimate || skill.requirements?.school">
      <div class="ultimate-area">
        <template v-if="skill.requirements?.ultimate">
          <Crown :size="14" class="ultimate-icon" />
          <MagicTag :text="`【終極技能】 ${skill.requirements.ultimate}`" type="gold" />
        </template>
      </div>
      <MagicTag v-if="skill.requirements?.school" :text="skill.requirements.school" type="default" />
    </div>
  </GlassCard>
</template>

<style scoped>
.skill-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

.skill-card.is-conflict {
  border-color: var(--danger);
  box-shadow: 0 0 20px var(--danger-bg);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.name-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}

.skill-name {
  font-size: 1.25rem;
  margin: 0;
  text-shadow: var(--name-glow);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.reorder-group {
  display: flex;
  gap: 2px;
}

.reorder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.reorder-btn:hover:not(:disabled) {
  color: var(--accent-cyan);
  border-color: var(--accent-cyan-border);
}

.reorder-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.favorite-btn {
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

.favorite-btn:hover {
  transform: scale(1.15);
}

.favorite-btn:active {
  transform: scale(0.95);
}

.favorite-btn.active {
  animation: heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.skill-body {
  background: var(--inset-bg);
  border-radius: 8px;
  padding: 12px;
}

.skill-formula {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.formula-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  flex: 1;
  min-width: 0;
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
  text-decoration: line-through;
}

.formula-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  text-align: left;
}

.formula-value.clickable {
  cursor: pointer;
  border-bottom: 1px dashed var(--accent-cyan-border);
  transition: color 0.2s ease, border-color 0.2s ease;
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
  padding: 0 8px;
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
  align-items: center;
  gap: 6px;
}

.ultimate-icon {
  color: var(--warning);
}
</style>
