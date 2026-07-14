<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import GameIcon from '@/components/ui/GameIcon.vue'
import MagicTag from '@/components/ui/MagicTag.vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  skill: {
    type: Object,
    required: true,
  },
  // 主/副技能名稱可點擊反查
  clickableBases: {
    type: Boolean,
    default: false,
  },
  // 與配技其他技能重複的基礎技能名稱
  conflictBases: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-base', 'select-enchant'])
const settingsStore = useSettingsStore()
const { t } = useI18n()

// 副技能帶附魔時會被消耗（遊戲規則）
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
</script>

<template>
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
</template>

<style scoped>
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

.card-part-icon {
  --icon-size: var(--icon-size-card-part);
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
</style>
