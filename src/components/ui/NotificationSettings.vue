<script setup>
import { computed } from 'vue'
import { Bell } from '@lucide/vue'
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
  { key: 'general', label: t('ui.notify.general'), desc: t('ui.notify.general.desc') },
  { key: 'pin', label: t('ui.notify.pin'), desc: t('ui.notify.pin.desc') },
  { key: 'favoriteSuccess', label: t('ui.notify.favoriteSuccess'), desc: t('ui.notify.favoriteSuccess.desc') },
  { key: 'favoriteWarning', label: t('ui.notify.favoriteWarning'), desc: t('ui.notify.favoriteWarning.desc') },
  { key: 'deleteSavedBuild', label: t('ui.notify.deleteSavedBuild'), desc: t('ui.notify.deleteSavedBuild.desc') }
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
              class="dropdown-option switch-option"
              @click="togglePref(opt.key)"
              :aria-checked="settingsStore.notificationPrefs[opt.key]"
              role="switch"
            >
              <div class="option-text-group">
                <span class="option-label">{{ opt.label }}</span>
                <span class="option-desc">{{ opt.desc }}</span>
              </div>
              <div 
                class="toggle-switch"
                :class="{ 'is-active': settingsStore.notificationPrefs[opt.key] }"
              >
                <div class="toggle-thumb"></div>
              </div>
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
  width: 280px;
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

.switch-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  text-align: left;
}

.option-text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.option-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.3;
}

.option-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.3;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background-color: var(--bg-modifier-hover);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-switch.is-active {
  background-color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background-color: var(--text-muted);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch.is-active .toggle-thumb {
  transform: translateX(16px);
  background-color: #fff;
  box-shadow: 0 0 8px var(--accent-cyan-glow);
}
</style>
