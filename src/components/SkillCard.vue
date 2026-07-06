<script setup>
import { computed } from 'vue'
import { Heart } from '@lucide/vue'
import { useFavoritesStore } from '../stores/favorites'
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
  }
})

const favoritesStore = useFavoritesStore()
const isFavorite = computed(() => favoritesStore.isFavorite(props.skill.id))

const toggle = () => {
  favoritesStore.toggleFavorite(props.skill.id)
}
</script>

<template>
  <GlassCard class="skill-card" :class="{ 'is-conflict': hasConflict }">
    <div class="skill-header">
      <div class="name-area">
        <h3 class="skill-name">{{ skill.name }}</h3>
        <MagicTag v-if="skill.requirements?.subject" :text="skill.requirements.subject" type="secondary" />
      </div>
      <button class="favorite-btn" @click="toggle" :class="{ active: isFavorite }">
        <Heart 
          :fill="isFavorite ? 'var(--accent-purple)' : 'none'" 
          :color="isFavorite ? 'var(--accent-purple)' : 'var(--text-muted)'" 
          :size="24" 
        />
      </button>
    </div>
    
    <div class="skill-body">
      <div class="skill-formula">
        <div class="formula-item">
          <span class="formula-label">主技能</span>
          <span class="formula-value">{{ skill.mainSkill.name }}</span>
          <MagicTag v-if="skill.mainSkill.enchant" :text="skill.mainSkill.enchant" type="primary" />
        </div>
        <div class="formula-divider">+</div>
        <div class="formula-item">
          <span class="formula-label">副技能</span>
          <span class="formula-value">{{ skill.subSkill.name }}</span>
          <MagicTag v-if="skill.subSkill.enchant" :text="skill.subSkill.enchant" type="primary" />
        </div>
      </div>
    </div>
    
    <div class="skill-footer" v-if="skill.requirements?.school">
      <MagicTag :text="skill.requirements.school" type="default" />
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
  border-color: #ff5555;
  box-shadow: 0 0 20px rgba(255, 85, 85, 0.25);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-name {
  font-size: 1.25rem;
  margin: 0;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}

.favorite-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 4px;
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
  background: rgba(0, 0, 0, 0.2);
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
  gap: 6px;
  flex: 1;
}

.formula-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.formula-value {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.formula-divider {
  font-weight: 700;
  color: var(--text-muted);
  font-size: 1.25rem;
  padding: 0 8px;
}

.skill-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
