<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
  enText: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'default', // 'primary', 'secondary', 'gold', 'warning', 'default'
  },
})
</script>

<template>
  <span class="magic-tag" :class="`tag-${type}`">
    <slot name="icon"></slot>
    <span class="tag-content">
      <span class="tag-text">{{ text }}</span>
      <span v-if="enText" class="tag-en">{{ enText }}</span>
    </span>
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

.tag-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0px;
}

.tag-text {
  line-height: 1.2;
}

.tag-en {
  font-size: 0.65rem;
  font-style: italic;
  opacity: 0.8;
  line-height: 1.1;
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
