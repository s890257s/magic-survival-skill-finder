<script setup>
import { computed } from 'vue'
import { Bell, CheckSquare, Square, Check, X } from '@lucide/vue'
import DropdownPanel from '@/components/ui/DropdownPanel.vue'
import { useI18n } from '@/composables/useI18n'
import { useDropdown } from '@/composables/useDropdown'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const settingsStore = useSettingsStore()

const { isOpen, triggerRef, panelStyle, close, toggle } = useDropdown({
  matchWidth: false,
  align: 'end',
})

const options = computed(() => [
  { key: 'general', label: t('ui.notify.general') },
  { key: 'pin', label: t('ui.notify.pin') },
  { key: 'favoriteSuccess', label: t('ui.notify.favoriteSuccess') },
  { key: 'favoriteWarning', label: t('ui.notify.favoriteWarning') }
])

const togglePref = (key) => {
  settingsStore.toggleNotification(key)
}

const selectAll = () => settingsStore.setAllNotifications(true)
const deselectAll = () => settingsStore.setAllNotifications(false)
</script>

<template>
  <div class="notification-dropdown">
    <button
      ref="triggerRef"
      type="button"
      class="glass-icon-btn notify-toggle"
      :class="{ 'is-open': isOpen }"
      @click="toggle"
      :aria-label="t('ui.notify.settings')"
      :title="t('ui.notify.settings')"
    >
      <Bell :size="20" />
    </button>

    <DropdownPanel :isOpen="isOpen" @close="close" :style="panelStyle">
      <div class="notify-panel-content">
        <div class="notify-header">
          <span class="notify-title">{{ t('ui.notify.settings') }}</span>
          <div class="notify-quick-actions">
            <button class="text-btn" @click="selectAll">{{ t('ui.notify.selectAll') }}</button>
            <span class="divider"></span>
            <button class="text-btn" @click="deselectAll">{{ t('ui.notify.deselectAll') }}</button>
          </div>
        </div>
        
        <ul class="dropdown-options notify-options">
          <li v-for="opt in options" :key="opt.key">
            <button
              type="button"
              class="dropdown-option checkbox-option"
              @click="togglePref(opt.key)"
            >
              <CheckSquare 
                v-if="settingsStore.notificationPrefs[opt.key]" 
                :size="18" 
                class="checkbox-icon checked" 
              />
              <Square 
                v-else 
                :size="18" 
                class="checkbox-icon" 
              />
              <span class="option-label">{{ opt.label }}</span>
            </button>
          </li>
        </ul>
      </div>
    </DropdownPanel>
  </div>
</template>

<style scoped>
.notification-dropdown {
  position: relative;
}

.notify-toggle.is-open {
  border-color: var(--accent-cyan);
  box-shadow: 0 0 0 2px var(--accent-cyan-glow);
}

.notify-panel-content {
  width: 240px;
  display: flex;
  flex-direction: column;
}

.notify-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 12px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 4px;
}

.notify-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.notify-quick-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-btn {
  background: none;
  border: none;
  color: var(--accent-cyan);
  font-size: 0.75rem;
  padding: 0;
  cursor: pointer;
}

.text-btn:hover {
  text-decoration: underline;
}

.divider {
  width: 1px;
  height: 10px;
  background: var(--glass-border);
}

.notify-options {
  max-height: 300px;
  overflow-y: auto;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
}

.checkbox-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.checkbox-icon.checked {
  color: var(--accent-cyan);
}

.option-label {
  font-size: 0.85rem;
  white-space: normal;
  line-height: 1.3;
}
</style>
