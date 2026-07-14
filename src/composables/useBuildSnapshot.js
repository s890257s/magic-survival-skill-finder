import { useFavoritesStore } from '@/stores/favorites'
import { useTrackerStore } from '@/stores/tracker'

// 配技與獲得追蹤的聯合快照：兩者的清空／移除操作需要一起復原
export function useBuildSnapshot() {
  const favoritesStore = useFavoritesStore()
  const trackerStore = useTrackerStore()

  const capture = () => ({
    favorites: [...favoritesStore.favoriteIds],
    tracker: [...trackerStore.acquiredBases],
  })

  const restore = (snapshot) => {
    favoritesStore.setFavorites(snapshot.favorites)
    trackerStore.setTracker(snapshot.tracker)
  }

  return { capture, restore }
}
