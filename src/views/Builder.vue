<script setup>
import { computed, ref, watch } from 'vue'
import { useFavoritesStore } from '../stores/favorites'
import skillsData from '../data/skills.json'
import SkillCard from '../components/SkillCard.vue'
import Toast from '../components/ui/Toast.vue'
import { Share2, Trash2, AlertTriangle, BookOpen } from '@lucide/vue'
import { RouterLink } from 'vue-router'

const favoritesStore = useFavoritesStore()

// State for toast
const toast = ref({ show: false, message: '', type: 'info' })

const showToast = (message, type = 'info') => {
  toast.value = { show: true, message, type }
}

const hideToast = () => {
  toast.value.show = false
}

// Compute favorite skills list
const favoriteSkills = computed(() => {
  return favoritesStore.favoriteIds
    .map(id => skillsData.find(s => s.id === id))
    .filter(Boolean)
})

// Conflict algorithm
// Returns a Map of skillId -> array of conflicting base skill names
const conflicts = computed(() => {
  const result = new Map()
  const baseSkillUsage = {} // baseSkillName -> array of skillIds
  
  favoriteSkills.value.forEach(skill => {
    const bases = []
    if (skill.mainSkill?.name) bases.push(skill.mainSkill.name)
    if (skill.subSkill?.name) bases.push(skill.subSkill.name)
    
    bases.forEach(base => {
      if (!baseSkillUsage[base]) {
        baseSkillUsage[base] = []
      }
      baseSkillUsage[base].push(skill.id)
    })
  })
  
  // Find duplicates
  Object.entries(baseSkillUsage).forEach(([base, ids]) => {
    if (ids.length > 1) {
      ids.forEach(id => {
        if (!result.has(id)) result.set(id, [])
        result.get(id).push(base)
      })
    }
  })
  
  return result
})

// Check if we need to show a warning toast when conflicts change
watch(() => conflicts.value.size, (newSize, oldSize) => {
  if (newSize > 0 && newSize > oldSize) {
    showToast('檢測到基礎技能衝突！', 'warning')
  }
})

const exportBuild = async () => {
  if (favoriteSkills.value.length === 0) {
    showToast('配裝清單為空，無法匯出', 'warning')
    return
  }
  
  let exportText = '【Magic Survival 我的配裝】\n\n'
  favoriteSkills.value.forEach((skill, index) => {
    exportText += `${index + 1}. ${skill.name}\n`
    exportText += `   - 主: ${skill.mainSkill.name} ${skill.mainSkill.enchant ? `(${skill.mainSkill.enchant})` : ''}\n`
    exportText += `   - 副: ${skill.subSkill.name} ${skill.subSkill.enchant ? `(${skill.subSkill.enchant})` : ''}\n`
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
  
  try {
    await navigator.clipboard.writeText(exportText)
    showToast('配裝已成功複製到剪貼簿！', 'success')
  } catch (err) {
    showToast('複製失敗，請手動選取複製', 'warning')
  }
}

const clearAll = () => {
  if (confirm('確定要清空所有配裝嗎？')) {
    favoritesStore.clearFavorites()
  }
}
</script>

<template>
  <div class="builder-view">
    <header class="builder-header">
      <div class="header-content">
        <h2>我的配裝</h2>
        <div class="header-actions">
          <button @click="clearAll" class="action-btn text-btn" v-if="favoriteSkills.length > 0">
            <Trash2 :size="18" /> 清空
          </button>
          <button @click="exportBuild" class="action-btn primary-btn">
            <Share2 :size="18" /> 匯出
          </button>
        </div>
      </div>
      <div v-if="conflicts.size > 0" class="conflict-banner">
        <AlertTriangle :size="20" />
        <span>注意：檢測到基礎技能被重複使用，已標記紅框。</span>
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
      
      <div v-else class="skill-grid">
        <SkillCard 
          v-for="skill in favoriteSkills" 
          :key="skill.id" 
          :skill="skill" 
          :hasConflict="conflicts.has(skill.id)"
        />
      </div>
    </div>

    <!-- Toast Notification -->
    <Transition name="toast-slide">
      <div class="toast-container" v-if="toast.show">
        <Toast 
          :message="toast.message" 
          :type="toast.type" 
          @close="hideToast" 
        />
      </div>
    </Transition>
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
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.primary-btn {
  background: rgba(0, 240, 255, 0.15);
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.primary-btn:hover {
  background: rgba(0, 240, 255, 0.25);
}

.text-btn {
  background: transparent;
  color: var(--text-secondary);
}

.text-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.conflict-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(255, 85, 85, 0.15);
  border: 1px solid rgba(255, 85, 85, 0.3);
  color: #ff5555;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.go-dictionary-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: rgba(181, 55, 242, 0.15);
  color: var(--accent-purple);
  border: 1px solid rgba(181, 55, 242, 0.3);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.go-dictionary-btn:hover {
  background: rgba(181, 55, 242, 0.25);
}

.skill-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .skill-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

.toast-container {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
