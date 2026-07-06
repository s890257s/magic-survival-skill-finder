<script setup>
</script>

<template>
  <div class="glass-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 var(--accent-cyan-glow);
}
</style>
