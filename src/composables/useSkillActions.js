import { useFavoritesStore } from '@/stores/favorites'
import { usePinnedStore } from '@/stores/pinned'
import { useToastStore } from '@/stores/toast'
import { useI18n } from '@/composables/useI18n'
import { useParticles } from '@/composables/useParticles'

// 技能卡的「加入配技 / 釘選」動作與對應 toast 文案，卡片元件只負責呈現。
// getSkill：回傳目標技能的 getter，讓動作永遠取到最新的 props.skill
export function useSkillActions(getSkill) {
  const favoritesStore = useFavoritesStore()
  const pinnedStore = usePinnedStore()
  const toastStore = useToastStore()
  const { t } = useI18n()
  const { spawnParticle } = useParticles()

  const togglePin = () => {
    const skill = getSkill()
    // 快照式復原：即使按下復原前狀態又被改過，也能回到動作前的樣子
    const backup = [...pinnedStore.pinnedIds]
    pinnedStore.togglePin(skill.id)
    toastStore.showToast(
      pinnedStore.isPinned(skill.id)
        ? t('ui.card.pinned', t(skill.name))
        : t('ui.card.unpinned', t(skill.name)),
      'info',
      {
        duration: 4000,
        actionLabel: t('ui.restore'),
        onAction: () => pinnedStore.setPins(backup),
        prefKey: 'pin',
      },
    )
  }

  const toggleFavorite = (e) => {
    const skill = getSkill()
    // 快照式復原（同上）
    const backup = [...favoritesStore.favoriteIds]
    const undoToggle = () => favoritesStore.setFavorites(backup)

    if (favoritesStore.isFavorite(skill.id)) {
      favoritesStore.toggleFavorite(skill.id)
      toastStore.showToast(t('ui.card.removed', t(skill.name)), 'info', {
        duration: 4000,
        actionLabel: t('ui.restore'),
        onAction: undoToggle,
        prefKey: 'favoriteSuccess',
      })
      return
    }

    // 加入前先偵測衝突，訊息才能列出「跟誰衝突」
    const hits = favoritesStore.getConflictingWith(skill)
    favoritesStore.toggleFavorite(skill.id)

    // 飛向配技 tab 的動畫
    if (e && e.clientX && e.clientY) {
      const targetEl = document.getElementById('dock-build-tab')
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect()
        const endX = rect.left + rect.width / 2
        const endY = rect.top + rect.height / 2
        spawnParticle(e.clientX, e.clientY, endX, endY, skill.name)
      }
    }

    if (hits.length > 0) {
      const detail = hits
        .map((h) => t('ui.card.conflictDetailItem', t(h.base), t(h.skillName)))
        .join('、')
      toastStore.showToast(t('ui.card.conflictDetail', detail), 'danger', {
        duration: 6000,
        actionLabel: t('ui.restore'),
        onAction: undoToggle,
        prefKey: 'favoriteWarning',
      })
    } else if (favoritesStore.isOverLimit) {
      toastStore.showToast(
        t('ui.card.addedOverLimit', favoritesStore.count, favoritesStore.maxSlots),
        'warning',
        {
          duration: 4000,
          actionLabel: t('ui.restore'),
          onAction: undoToggle,
          prefKey: 'favoriteWarning',
        },
      )
    } else {
      toastStore.showToast(
        t('ui.card.added', t(skill.name), favoritesStore.count, favoritesStore.maxSlots),
        'success',
        {
          duration: 4000,
          actionLabel: t('ui.restore'),
          onAction: undoToggle,
          prefKey: 'favoriteSuccess',
        },
      )
    }
  }

  return { togglePin, toggleFavorite }
}
