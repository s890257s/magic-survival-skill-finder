// 就地切換元素：已存在則移除，否則附加到尾端
export const toggleInArray = (list, item) => {
  const index = list.indexOf(item)
  if (index === -1) {
    list.push(item)
  } else {
    list.splice(index, 1)
  }
}

// 就地交換兩個元素的位置（任一不存在則不動作）
export const swapInArray = (list, itemA, itemB) => {
  const a = list.indexOf(itemA)
  const b = list.indexOf(itemB)
  if (a === -1 || b === -1) return
  ;[list[a], list[b]] = [list[b], list[a]]
}

// 拖曳排序：visibleIds 為畫面上可見的項目（依目前順序），oldIndex/newIndex 為可見清單內的移動。
// 回傳 list 的新排序；不在畫面上的項目（如已失效者）保留原位置
export const reorderVisible = (list, visibleIds, oldIndex, newIndex) => {
  const newOrder = [...visibleIds]
  const moved = newOrder.splice(oldIndex, 1)[0]
  newOrder.splice(newIndex, 0, moved)

  const visibleSet = new Set(visibleIds)
  let ptr = 0
  return list.map((id) => (visibleSet.has(id) ? newOrder[ptr++] : id))
}
