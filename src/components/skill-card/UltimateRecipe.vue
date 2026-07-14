<script setup>
import GameIcon from '@/components/ui/GameIcon.vue'
import MagicTag from '@/components/ui/MagicTag.vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  // skill.requirements：ultimate 必有，subject / school 可能缺
  requirements: {
    type: Object,
    required: true,
  },
  // 實驗體名稱可點擊反查
  clickable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-subject'])
const { t } = useI18n()

const onSubjectClick = (subjectName) => {
  if (props.clickable) {
    emit('select-subject', subjectName)
  }
}
</script>

<template>
  <div class="ultimate-area">
    <div class="ultimate-group">
      <span class="part-label invisible" aria-hidden="true">_</span>
      <div class="ultimate-group-content">
        <GameIcon :name="requirements.ultimate" category="ultimate" class="ultimate-icon" />
        <span class="ultimate-text">{{ t('ui.card.ultimateSkill', t(requirements.ultimate)) }}</span>
      </div>
    </div>

    <div class="ultimate-group">
      <span class="part-label invisible" aria-hidden="true">_</span>
      <div class="ultimate-group-content">
        <span class="ultimate-operator">=</span>
      </div>
    </div>

    <div class="ultimate-group" v-if="requirements.subject">
      <span class="part-label">{{ t('ui.builder.exportSubject') }}</span>
      <div class="ultimate-group-content">
        <MagicTag
          :text="t(requirements.subject)"
          type="secondary"
          :class="{ 'clickable-tag': clickable }"
          @click="onSubjectClick(requirements.subject)"
        >
          <template #icon>
            <GameIcon :name="requirements.subject" category="subject" class="card-tiny-icon" />
          </template>
        </MagicTag>
      </div>
    </div>

    <div class="ultimate-group" v-if="requirements.subject && requirements.school">
      <span class="part-label invisible" aria-hidden="true">_</span>
      <div class="ultimate-group-content">
        <span class="ultimate-operator">+</span>
      </div>
    </div>

    <div class="ultimate-group" v-if="requirements.school">
      <span class="part-label">{{ t('ui.builder.exportSchool') }}</span>
      <div class="ultimate-group-content">
        <MagicTag :text="t(requirements.school)" type="primary">
          <template #icon>
            <GameIcon :name="requirements.school" category="school" class="card-tiny-icon" />
          </template>
        </MagicTag>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* 內容窄於容器時置中，寬於容器時可捲動 */
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
  --icon-size: var(--icon-size-card-small);
  color: var(--warning);
  flex-shrink: 0;
}

.card-tiny-icon {
  --icon-size: var(--icon-size-card-tiny);
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
</style>
