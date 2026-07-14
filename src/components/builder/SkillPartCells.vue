<script setup>
import { CheckCircle2 } from '@lucide/vue'
import { useTrackerStore } from '@/stores/tracker'
import { useI18n } from '@/composables/useI18n'
import GameIcon from '@/components/ui/GameIcon.vue'

// 配技總表的單一基礎技能欄位（icon + 名稱兩個 td）：點擊切換「已獲得」狀態
const props = defineProps({
  // { name, enchant? }
  part: {
    type: Object,
    required: true,
  },
  // 與其他配方重複使用
  conflicted: {
    type: Boolean,
    default: false,
  },
  // td-text 的顏色 class（main-text / sub-text）
  textClass: {
    type: String,
    default: '',
  },
})

const trackerStore = useTrackerStore()
const { t } = useI18n()

const toggle = () => trackerStore.toggleAcquired(props.part.name)
</script>

<template>
  <td class="td-icon tracker-cell" @click="toggle" :class="{ 'is-acquired': trackerStore.isAcquired(part.name) }">
    <div class="tracker-icon-wrapper">
      <GameIcon :name="part.name" category="skill" class="part-icon" />
      <div v-if="trackerStore.isAcquired(part.name)" class="acquired-badge">
        <CheckCircle2 :size="16" />
      </div>
    </div>
  </td>
  <td
    class="td-text tracker-cell"
    :class="[textClass, { 'is-conflicted': conflicted, 'is-acquired': trackerStore.isAcquired(part.name) }]"
    @click="toggle"
    :title="conflicted ? t('ui.card.conflictBadge') : undefined"
  >
    <div class="part-title-group">
      <div class="part-name">{{ t(part.name) }}</div>
      <span v-if="part.enchant" class="enchant">({{ t(part.enchant) }})</span>
    </div>
  </td>
</template>

<style scoped>
.td-icon,
.td-text {
  text-align: center;
  vertical-align: middle;
  height: 100%;
  padding: 10px 4px;
}

.part-icon {
  --icon-size: var(--icon-size-summary);
}

.part-title-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 100%;
}

.main-text {
  color: var(--accent-cyan);
}

.sub-text {
  color: var(--accent-purple);
}

.td-text.is-conflicted {
  color: var(--danger);
  text-shadow: 0 0 8px var(--danger-border);
}

.enchant {
  font-size: 0.75em;
  opacity: 0.85;
}

.tracker-cell {
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
  user-select: none;
}

.tracker-cell:active {
  transform: scale(0.95);
}

.tracker-icon-wrapper {
  position: relative;
  display: inline-block;
}

.acquired-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  color: var(--success, #10b981);
  background: var(--bg-primary, #1e1e2e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop-in {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

.td-icon.is-acquired .part-icon {
  filter: drop-shadow(0 0 6px var(--success, rgba(16, 185, 129, 0.6)));
}

.td-text.is-acquired {
  color: var(--success, #10b981);
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
}

.td-text.is-acquired .enchant {
  color: var(--text-muted);
}
</style>
