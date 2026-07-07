<script setup>
import { ref } from 'vue'

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

const onScroll = (e) => {
  if (panelRef.value && (e.target === panelRef.value || panelRef.value.contains(e.target))) {
    return
  }
  close()
}

const onKeydown = (e) => {
  if (e.key === 'Escape') close()
}

// Watch for isOpen changes to bind/unbind events
import { watch, onBeforeUnmount } from 'vue'

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
    document.addEventListener('keydown', onKeydown)
  } else {
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', close)
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', close)
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
