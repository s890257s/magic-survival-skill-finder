import { ref, watch, onUnmounted } from 'vue'

// 浮層共用狀態（模組層，跨元件）：
// - body 捲動鎖：計數式，支援 modal 與 dock 疊加，最後一個解除者才還原捲動
// - 浮層登記：讓底層 UI（如 BottomDock 的 Esc 處理）判斷上方是否還有 modal / dropdown

let scrollLockCount = 0

const lockScroll = () => {
  if (++scrollLockCount === 1) document.body.style.overflow = 'hidden'
}
const unlockScroll = () => {
  if (scrollLockCount > 0 && --scrollLockCount === 0) document.body.style.overflow = ''
}

const overlayCount = ref(0)

export const hasOpenOverlay = () => overlayCount.value > 0

// 依 boolean 來源自動進出某個成對狀態；元件卸載時自動歸還，避免計數洩漏
const useFlag = (source, activate, deactivate) => {
  let active = false
  const set = (val) => {
    if (!!val === active) return
    active = !!val
    if (active) {
      activate()
    } else {
      deactivate()
    }
  }
  watch(source, set, { immediate: true })
  onUnmounted(() => set(false))
}

// source 為 true 期間鎖定背景捲動
export function useBodyScrollLock(source) {
  useFlag(source, lockScroll, unlockScroll)
}

// source 為 true 期間登記為開啟中的浮層
export function useOverlayPresence(source) {
  useFlag(
    source,
    () => overlayCount.value++,
    () => overlayCount.value--,
  )
}
