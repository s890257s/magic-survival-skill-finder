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
