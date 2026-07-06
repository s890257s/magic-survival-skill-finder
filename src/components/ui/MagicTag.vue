<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default', // 'primary', 'secondary', 'warning', 'default'
  }
})
</script>

<template>
  <span class="magic-tag" :class="`tag-${type}`">
    {{ text }}
  </span>
</template>

<style scoped>
.magic-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  white-space: nowrap;
}

.tag-default {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.tag-primary {
  background: rgba(0, 240, 255, 0.15);
  color: var(--accent-cyan);
  border: 1px solid rgba(0, 240, 255, 0.3);
}

.tag-secondary {
  background: rgba(181, 55, 242, 0.15);
  color: var(--accent-purple);
  border: 1px solid rgba(181, 55, 242, 0.3);
}

.tag-warning {
  background: rgba(255, 85, 85, 0.15);
  color: #ff5555;
  border: 1px solid rgba(255, 85, 85, 0.3);
}
</style>
