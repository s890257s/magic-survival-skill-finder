import { watch, onBeforeUnmount } from 'vue'
import Sortable from 'sortablejs'

// SortableJS 與 Vue 列表渲染共存的整合層：
// - 監聽容器 ref：容器隨 v-if / v-else 重建時，自動銷毀舊實例並綁定新節點
//   （固定實例會殘留在已移除的 DOM 上，拖曳會靜默失效）
// - 拖曳結束後先把被移動的 DOM 還原到拖曳前的位置，再交由資料驅動重新渲染，
//   避免 Sortable 動過的 DOM 與 Vue 的 VDOM 對不上
export function useSortableList(containerRef, onReorder, sortableOptions = {}) {
  let sortable = null

  const destroy = () => {
    if (sortable) {
      sortable.destroy()
      sortable = null
    }
  }

  const handleSortEnd = (evt) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) return

    const itemEl = evt.item
    if (evt.from) {
      const siblings = Array.from(evt.from.childNodes).filter((node) => node.nodeType === 1)
      if (oldIndex < siblings.length) {
        evt.from.insertBefore(itemEl, siblings[oldIndex])
      } else {
        evt.from.appendChild(itemEl)
      }
    }

    onReorder(oldIndex, newIndex)
  }

  watch(
    containerRef,
    (el) => {
      destroy()
      if (el) {
        sortable = Sortable.create(el, {
          animation: 150,
          ...sortableOptions,
          onEnd: handleSortEnd,
        })
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(destroy)
}
