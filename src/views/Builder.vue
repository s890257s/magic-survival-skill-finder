<script setup>
import { computed } from 'vue'
import { useFavoritesStore, MAX_SLOTS } from '../stores/favorites'
import { useToastStore } from '../stores/toast'
import SkillCard from '../components/SkillCard.vue'
import ThemeToggle from '../components/ui/ThemeToggle.vue'
import { Share2, Trash2, AlertTriangle, BookOpen, Layers } from '@lucide/vue'
import { RouterLink } from 'vue-router'

const favoritesStore = useFavoritesStore()
const toastStore = useToastStore()

const favoriteSkills = computed(() => favoritesStore.favoriteSkills)
const conflicts = computed(() => favoritesStore.conflicts)

const buildExportText = () => {
  let exportText = '【Magic Survival 我的配裝】\n\n'
  favoriteSkills.value.forEach((skill, index) => {
    exportText += `${index + 1}. ${skill.name}\n`
    exportText += `   - 主: ${skill.mainSkill.name} ${skill.mainSkill.enchant ? `(${skill.mainSkill.enchant})` : ''}\n`
    exportText += `   - 副: ${skill.subSkill.name} ${skill.subSkill.enchant ? `(${skill.subSkill.enchant})` : ''}\n`
    if (skill.requirements?.ultimate) {
      exportText += `   - 終極: ${skill.requirements.ultimate}\n`
    }
    if (skill.requirements?.school) {
      exportText += `   - 學派: ${skill.requirements.school}\n`
    }
    if (skill.requirements?.subject) {
      exportText += `   - 實驗體: ${skill.requirements.subject}\n`
    }
    exportText += '\n'
  })

  if (conflicts.value.size > 0) {
    exportText += '⚠️ 注意：目前配裝存在基礎技能衝突！\n'
  }
  return exportText
}

const exportBuild = async () => {
  if (favoriteSkills.value.length === 0) {
    toastStore.showToast('配裝清單為空，無法匯出', 'warning')
    return
  }

  const exportText = buildExportText()

  // 手機優先走系統分享面板
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Magic Survival 我的配裝', text: exportText })
      return
    } catch (err) {
      if (err.name === 'AbortError') return // 使用者取消分享
      // 其他錯誤退回剪貼簿
    }
  }

  try {
    await navigator.clipboard.writeText(exportText)
    toastStore.showToast('配裝已複製到剪貼簿！', 'success')
  } catch (err) {
    toastStore.showToast('複製失敗，請手動選取複製', 'warning')
  }
}

const clearAll = () => {
  const backup = [...favoritesStore.favoriteIds]
  favoritesStore.clearFavorites()
  toastStore.showToast('已清空配裝', 'info', {
    duration: 6000,
    actionLabel: '復原',
    onAction: () => favoritesStore.setFavorites(backup),
  })
}
</script>

<template>
  <div class="builder-view">
    <header class="builder-header">
      <div class="header-content">
        <div class="title-area">
          <h2>我的配裝</h2>
          <span
            v-if="favoritesStore.count > 0"
            class="slot-count"
            :class="{ over: favoritesStore.isOverLimit }"
          >
            {{ favoritesStore.count }}/{{ MAX_SLOTS }}
          </span>
        </div>
        <div class="header-actions">
          <button @click="clearAll" class="action-btn text-btn" v-if="favoriteSkills.length > 0">
            <Trash2 :size="18" /> 清空
          </button>
          <button @click="exportBuild" class="action-btn primary-btn">
            <Share2 :size="18" /> 匯出
          </button>
          <ThemeToggle class="compact-toggle" />
        </div>
      </div>
      <div v-if="favoritesStore.isOverLimit" class="banner limit-banner">
        <Layers :size="20" />
        <span>超過遊戲常規上限（{{ MAX_SLOTS }} 個），實戰時記得取捨喔。</span>
      </div>
      <div v-if="conflicts.size > 0" class="banner conflict-banner">
        <AlertTriangle :size="20" />
        <span>檢測到基礎技能被重複使用，衝突技能已標記紅框。</span>
      </div>
    </header>

    <div class="build-content">
      <div v-if="favoriteSkills.length === 0" class="empty-state">
        <div class="empty-icon-wrap">
          <BookOpen :size="48" />
        </div>
        <p>尚未添加任何技能到配裝中</p>
        <RouterLink to="/" class="go-dictionary-btn">前往圖鑑添加</RouterLink>
      </div>

      <TransitionGroup v-else tag="div" name="card-move" class="skill-grid">
        <SkillCard
          v-for="(skill, index) in favoriteSkills"
          :key="skill.id"
          :skill="skill"
          :hasConflict="conflicts.has(skill.id)"
          :conflictBases="conflicts.get(skill.id) || []"
          reorderable
          :isFirst="index === 0"
          :isLast="index === favoriteSkills.length - 1"
          @move="(delta) => favoritesStore.moveFavorite(skill.id, delta)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.builder-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.builder-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-dark);
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: background-color 0.3s ease;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-area h2 {
  margin: 0;
  font-size: 1.35rem;
  white-space: nowrap;
}

.slot-count {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 3px 10px;
  white-space: nowrap;
  border-radius: 999px;
  background: var(--accent-cyan-bg);
  border: 1px solid var(--accent-cyan-border);
  color: var(--accent-cyan);
}

.slot-count.over {
  background: var(--danger-bg);
  border-color: var(--danger-border);
  color: var(--danger);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions .compact-toggle {
  width: 40px;
  height: 40px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.primary-btn {
  background: var(--accent-cyan-bg);
  color: var(--accent-cyan);
  border: 1px solid var(--accent-cyan-border);
}

.primary-btn:hover {
  background: var(--accent-cyan-bg-strong);
}

.text-btn {
  background: transparent;
  color: var(--text-secondary);
}

.text-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.conflict-banner {
  background: var(--danger-bg);
  border: 1px solid var(--danger-border);
  color: var(--danger);
}

.limit-banner {
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
  color: var(--warning);
}

.build-content {
  padding: 16px;
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  gap: 16px;
  height: 100%;
}

.empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
}

.go-dictionary-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: var(--accent-purple-bg);
  color: var(--accent-purple);
  border: 1px solid var(--accent-purple-border);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.go-dictionary-btn:hover {
  background: var(--accent-purple-bg-strong);
}

.skill-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.card-move-move {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-move-leave-active {
  transition: all 0.25s ease;
  position: absolute;
  width: 100%;
}

.card-move-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (min-width: 768px) {
  .skill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }

  .card-move-leave-active {
    width: auto;
  }
}
</style>
