<script setup>
import { Trash2 } from '@lucide/vue'
import { gameVersion } from '@/data/meta'
import HeaderActions from '@/components/layout/HeaderActions.vue'
import { useI18n } from '@/composables/useI18n'

const emit = defineEmits(['clear'])
const { t } = useI18n()
</script>

<template>
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
        <button class="glass-icon-btn" @click="emit('clear')" :title="t('ui.dict.clearAll')">
          <Trash2 :size="20" />
        </button>
      </div>
    </div>
    <hr class="header-divider" />
  </div>
</template>

<style scoped>
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
</style>
