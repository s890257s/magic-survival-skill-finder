<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useSavedBuildsStore } from '@/stores/savedBuilds'
import { useToastStore } from '@/stores/toast'
import Modal from '@/components/ui/Modal.vue'
import { useI18n } from '@/composables/useI18n'
import { formatDate } from '@/utils/format'
import { isDesktopWidth } from '@/utils/device'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show'])

const favoritesStore = useFavoritesStore()
const savedBuildsStore = useSavedBuildsStore()
const toastStore = useToastStore()
const { t } = useI18n()

const saveNameInput = ref('')
const saveNameInputRef = ref(null)
const saveMode = ref('new')

const savedBuilds = computed(() => savedBuildsStore.savedBuilds)

watch(() => props.show, async (newShow) => {
  if (newShow) {
    if (savedBuilds.value.length >= savedBuildsStore.maxSavedBuilds) {
      saveMode.value = savedBuilds.value[0].id
      saveNameInput.value = savedBuilds.value[0].name
    } else {
      saveMode.value = 'new'
      saveNameInput.value = `${t('ui.builder.defaultSaveName')} ${savedBuilds.value.length + 1}`
    }
    await nextTick()
    if (saveNameInputRef.value && isDesktopWidth()) {
      saveNameInputRef.value.focus()
    }
  }
})

watch(saveMode, (newMode) => {
  if (newMode === 'new') {
    saveNameInput.value = `${t('ui.builder.defaultSaveName')} ${savedBuilds.value.length + 1}`
  } else {
    const build = savedBuilds.value.find(b => b.id === newMode)
    if (build) saveNameInput.value = build.name
  }
})

const confirmSave = () => {
  const name = saveNameInput.value.trim() || t('ui.builder.defaultSaveName')
  if (saveMode.value === 'new') {
    if (!savedBuildsStore.saveBuild(name, favoritesStore.favoriteIds)) {
      // 達存檔上限（開啟 modal 後上限才被觸及的邊界情況）
      toastStore.showToast(t('ui.builder.saveLimitMsg', savedBuildsStore.maxSavedBuilds), 'warning', {
        prefKey: 'general',
      })
      return
    }
  } else {
    savedBuildsStore.updateBuild(saveMode.value, { name, skillIds: favoritesStore.favoriteIds })
  }
  toastStore.showToast(t('ui.builder.saveSuccess'), 'success', { prefKey: 'general' })
  emit('update:show', false)
}
</script>

<template>
  <Modal :show="show" :title="t('ui.builder.saveTitle')" @close="$emit('update:show', false)">
    <div class="save-content">
      <div class="save-field">
        <label>{{ t('ui.builder.savePlaceholder') }}</label>
        <input
          ref="saveNameInputRef"
          type="text"
          v-model="saveNameInput"
          :placeholder="t('ui.builder.savePlaceholder')"
          class="text-input"
          @keyup.enter="confirmSave"
        />
      </div>
      <div class="save-field">
        <label>{{ t('ui.builder.saveTarget') }}</label>
        <div class="save-options">
          <label v-if="savedBuilds.length < savedBuildsStore.maxSavedBuilds" class="save-option-label glass-panel" :class="{ active: saveMode === 'new' }">
            <input type="radio" v-model="saveMode" value="new" class="hidden-radio" />
            <div class="save-option-content">
              <span class="save-option-name">{{ t('ui.builder.createNewSave') }}</span>
            </div>
          </label>
          <label v-for="build in savedBuilds" :key="build.id" class="save-option-label glass-panel" :class="{ active: saveMode === build.id }">
            <input type="radio" v-model="saveMode" :value="build.id" class="hidden-radio" />
            <div class="save-option-content">
              <span class="save-option-name">{{ build.name }}</span>
              <span class="save-option-date">{{ formatDate(build.date) }}</span>
            </div>
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-text" @click="$emit('update:show', false)">{{ t('ui.cancel') }}</button>
        <button class="btn btn-primary" @click="confirmSave">{{ t('ui.builder.save') }}</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.save-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.save-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.save-field label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.save-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}

.save-option-label {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  border: 1px solid transparent;
}

.save-option-label:hover {
  background: var(--bg-hover);
}

.save-option-label.active {
  border-color: var(--accent-cyan);
  background: var(--accent-cyan-bg);
}

.hidden-radio {
  display: none;
}

.save-option-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.save-option-name {
  font-weight: 700;
}
.save-option-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
