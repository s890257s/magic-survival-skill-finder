<script setup>
import { ref } from 'vue'
import { Trash2, Download } from '@lucide/vue'
import { useSavedBuildsStore } from '@/stores/savedBuilds'
import GameIcon from '@/components/ui/GameIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { formatDate } from '@/utils/format'

const props = defineProps({
  // 存檔物件，帶預先展開的 summaryLines（SavedBuildsPanel 準備）
  build: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['load', 'delete'])
const savedBuildsStore = useSavedBuildsStore()
const { t } = useI18n()

const isEditing = ref(false)
const editingName = ref('')

const startEditing = () => {
  isEditing.value = true
  editingName.value = props.build.name
}

const finishEditing = () => {
  if (!isEditing.value) return
  if (editingName.value.trim()) {
    savedBuildsStore.updateBuild(props.build.id, { name: editingName.value.trim() })
  }
  isEditing.value = false
}
</script>

<template>
  <div class="saved-build-card glass-panel" @click="emit('load')">
    <div class="saved-build-header">
      <input
        v-if="isEditing"
        type="text"
        v-model="editingName"
        @blur="finishEditing"
        @keyup.enter="finishEditing"
        @click.stop
        class="inline-edit-input"
        v-focus
      />
      <span
        v-else
        class="saved-build-name"
        @click.stop="startEditing"
        :title="t('ui.builder.saveTitle')"
      >
        {{ build.name }}
      </span>
      <span class="saved-build-date">{{ formatDate(build.date) }}</span>
    </div>
    <div class="saved-build-summary">
      <div v-for="(line, idx) in build.summaryLines" :key="idx" class="summary-line">
        <span class="icon-text"><GameIcon :name="line.fusionName" category="fusion" class="list-mini-icon" /> {{ t(line.fusionName) }}</span> =
        <span class="icon-text"><GameIcon :name="line.mainName" category="skill" class="list-mini-icon" /> {{ t(line.mainName) }}</span><span v-if="line.mainEnchant">({{ t(line.mainEnchant) }})</span> +
        <span class="icon-text"><GameIcon :name="line.subName" category="skill" class="list-mini-icon" /> {{ t(line.subName) }}</span><span v-if="line.subEnchant">({{ t(line.subEnchant) }})</span>
      </div>
    </div>
    <div class="saved-build-actions">
      <button class="btn btn-text btn-sm" @click.stop="emit('load')">
        <Download :size="14" /> {{ t('ui.builder.load') }}
      </button>
      <button class="btn btn-danger-text btn-sm" @click.stop="emit('delete')">
        <Trash2 :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.saved-build-card {
  width: 100%;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.saved-build-card:hover {
  border-color: rgba(0, 230, 255, 0.3);
  transform: translateY(-2px);
}

.saved-build-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.saved-build-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: text;
  border-bottom: 1px dashed transparent;
  transition: border-color 0.2s;
}

.saved-build-name:hover {
  border-bottom-color: var(--accent-cyan);
}

.inline-edit-input {
  background: var(--bg-dark);
  border: 1px solid var(--accent-cyan);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 0 4px;
  width: 140px;
  outline: none;
}

.saved-build-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.saved-build-summary {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.list-mini-icon {
  --icon-size: var(--icon-size-list-mini);
}

.saved-build-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  border-top: 1px dashed var(--glass-border);
  padding-top: 8px;
  margin-top: auto;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 0.8rem;
  height: 32px;
}
</style>
