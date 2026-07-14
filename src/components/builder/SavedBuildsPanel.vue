<script setup>
import { computed, ref } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import { useSavedBuildsStore } from '@/stores/savedBuilds'
import { useToastStore } from '@/stores/toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SavedBuildCard from '@/components/builder/SavedBuildCard.vue'
import { Save, Trash2 } from '@lucide/vue'
import { useI18n } from '@/composables/useI18n'
import { skillsById } from '@/data'

const favoritesStore = useFavoritesStore()
const savedBuildsStore = useSavedBuildsStore()
const toastStore = useToastStore()
const { t } = useI18n()

const showClearSavedConfirm = ref(false)

const clearSavedBuilds = () => {
  savedBuildsStore.clearSavedBuilds()
  showClearSavedConfirm.value = false
}

const handleDeleteSavedBuild = (id) => {
  const index = savedBuildsStore.savedBuilds.findIndex((b) => b.id === id)
  const build = savedBuildsStore.savedBuilds[index]
  if (!build) return

  // 深拷貝快照，避免復原時拿到已被改動的 reactive 物件
  const buildCopy = JSON.parse(JSON.stringify(build))
  savedBuildsStore.deleteSavedBuild(id)

  toastStore.showUndoToast(t('ui.builder.deletedBuildMsg', buildCopy.name), () =>
    savedBuildsStore.restoreBuild(buildCopy, index),
  )
}

// 讀取存檔＝把存檔的技能組套用為當前配技
const loadBuild = (build) => {
  favoritesStore.setFavorites(build.skills)
}

// 每筆存檔預先展開為顯示用的配方列（失效 id 略過）
const enrichedSavedBuilds = computed(() =>
  savedBuildsStore.savedBuilds.map((build) => ({
    ...build,
    summaryLines: (build.skills || [])
      .map((id) => {
        const s = skillsById.get(id)
        if (!s) return null
        return {
          fusionName: s.name,
          mainName: s.mainSkill?.name,
          mainEnchant: s.mainSkill?.enchant,
          subName: s.subSkill?.name,
          subEnchant: s.subSkill?.enchant,
        }
      })
      .filter(Boolean),
  })),
)
</script>

<template>
  <div class="saved-builds-section" v-if="enrichedSavedBuilds.length > 0">
    <div class="section-header">
      <h3 class="section-title"><Save :size="18" /> {{ t('ui.builder.savedBuilds') }} ({{ enrichedSavedBuilds.length }}/{{ savedBuildsStore.maxSavedBuilds }})</h3>
      <button class="btn btn-text btn-sm" @click="showClearSavedConfirm = true">
        <Trash2 :size="14" /> {{ t('ui.builder.clear') }}
      </button>
    </div>
    <div class="saved-builds-container">
      <SavedBuildCard
        v-for="build in enrichedSavedBuilds"
        :key="build.id"
        :build="build"
        @load="loadBuild(build)"
        @delete="handleDeleteSavedBuild(build.id)"
      />
    </div>

    <ConfirmDialog
      v-model:show="showClearSavedConfirm"
      :title="t('ui.builder.clear')"
      :message="t('ui.builder.clearSavedConfirm')"
      :confirmText="t('ui.builder.clear')"
      :cancelText="t('ui.cancel')"
      @confirm="clearSavedBuilds"
    />
  </div>
</template>

<style scoped>
.saved-builds-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  color: var(--text-primary);
  margin: 0;
}

.saved-builds-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 4px;
}

.btn-sm {
  padding: 4px 10px;
  font-size: 0.8rem;
  height: 32px;
}
</style>
