<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'default', // 'primary', 'secondary', 'gold', 'warning', 'default'
  }
})
</script>

<template>
  <span class="magic-tag" :class="`tag-${type}`">
    <slot name="icon"></slot>
    {{ text }}
  </span>
</template>

<style scoped>
.magic-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
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
  background: var(--tag-default-bg);
  color: var(--text-secondary);
  border: 1px solid var(--tag-default-border);
}

.tag-primary {
  background: var(--accent-cyan-bg);
  color: var(--accent-cyan);
  border: 1px solid var(--accent-cyan-border);
}

.tag-secondary {
  background: var(--accent-purple-bg);
  color: var(--accent-purple);
  border: 1px solid var(--accent-purple-border);
}

.tag-gold {
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px solid var(--warning-border);
}

.tag-warning {
  background: var(--danger-bg);
  color: var(--danger);
  border: 1px solid var(--danger-border);
}
</style>
