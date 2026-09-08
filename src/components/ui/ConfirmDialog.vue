<script setup>
import Modal from './Modal.vue'

defineProps({
  show: Boolean,
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'primary'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}
</script>

<template>
  <Modal :show="show" :title="title" @close="handleCancel">
    <div class="confirm-content">
      <slot>
        <p>{{ message }}</p>
      </slot>
      <div class="confirm-actions">
        <button class="btn btn-text" @click="handleCancel">{{ cancelText }}</button>
        <button :class="['btn', `btn-${variant}`]" @click="handleConfirm">{{ confirmText }}</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.confirm-content p {
  margin: 0 0 24px 0;
  line-height: 1.5;
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
