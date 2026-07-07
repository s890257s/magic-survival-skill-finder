<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const panelRef = ref(null)

const close = () => {
  emit('close')
}

let lastWindowWidth = typeof window !== 'undefined' ? window.innerWidth : 0

const onScroll = (e) => {
  if (panelRef.value && (e.target === panelRef.value || panelRef.value.contains(e.target))) {
    return
  }

  // 防止手機版點擊輸入框時，因為瀏覽器自動捲動導致面板關閉
  if (panelRef.value && document.activeElement && panelRef.value.contains(document.activeElement)) {
    return
  }

  // 忽略不可捲動容器的假捲動事件（如 overflow:hidden 的篩選面板在焦點移動時觸發）
  const el = e.target
  if (el instanceof Element && el.scrollHeight <= el.clientHeight) {
    return
  }
  close()
}

const onResize = () => {
  // 防止手機版鍵盤彈出觸發 resize 導致面板關閉
  if (panelRef.value && document.activeElement && panelRef.value.contains(document.activeElement)) {
    return
  }

  // 只在視窗寬度改變時才關閉（忽略因手機鍵盤彈出造成的單純高度改變）
  if (window.innerWidth !== lastWindowWidth) {
    lastWindowWidth = window.innerWidth
    close()
  }
}

const onKeydown = (e) => {
  if (e.key === 'Escape') close()
}

// 開啟期間監聽全域事件（捲動/縮放/Escape 皆關閉面板）
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      lastWindowWidth = typeof window !== 'undefined' ? window.innerWidth : 0
      window.addEventListener('scroll', onScroll, true)
      window.addEventListener('resize', onResize)
      document.addEventListener('keydown', onKeydown)
    } else {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('keydown', onKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onKeydown)
})

defineExpose({
  panelRef
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="dropdown-backdrop" @click="close"></div>
    <Transition name="panel-fade">
      <div 
        v-if="isOpen" 
        class="dropdown-panel glass-panel"
        ref="panelRef"
        v-bind="$attrs"
      >
        <slot></slot>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-dropdown-backdrop, 1500);
  background: transparent;
}

.dropdown-panel {
  z-index: var(--z-dropdown, 1600);
  padding: 6px;
  border-radius: 12px;
  box-shadow: var(--shadow-strong);
  display: flex;
  flex-direction: column;
}
</style>
