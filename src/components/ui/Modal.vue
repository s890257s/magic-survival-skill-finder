<script>
// 背景捲動鎖：模組層計數（跨 Modal 實例共用），支援多個 modal 疊加
let scrollLockCount = 0
const lockScroll = () => {
  if (++scrollLockCount === 1) document.body.style.overflow = 'hidden'
}
const unlockScroll = () => {
  if (scrollLockCount > 0 && --scrollLockCount === 0) document.body.style.overflow = ''
}
</script>

<script setup>
import { X } from '@lucide/vue'
import { ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  title: String
})

const emit = defineEmits(['close'])

const containerRef = ref(null)

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  // Tab 循環鎖定在 modal 內，避免焦點跑到被遮住的背景內容
  if (e.key !== 'Tab' || !containerRef.value) return
  const focusables = Array.from(containerRef.value.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.disabled,
  )
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

// 開啟時記住觸發元素，關閉後把焦點還回去
let previouslyFocused = null

const onOpen = async () => {
  lockScroll()
  window.addEventListener('keydown', handleKeydown)
  previouslyFocused = document.activeElement
  await nextTick()
  containerRef.value?.focus()
}

const onClose = () => {
  unlockScroll()
  window.removeEventListener('keydown', handleKeydown)
  previouslyFocused?.focus?.()
  previouslyFocused = null
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      onOpen()
    } else {
      onClose()
    }
  },
)

onUnmounted(() => {
  if (props.show) onClose()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="emit('close')">
        <div
          ref="containerRef"
          class="modal-container"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <header class="modal-header">
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="emit('close')">
              <X :size="20" />
            </button>
          </header>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
}

.modal-container {
  background: var(--bg-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  outline: none;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}
</style>
