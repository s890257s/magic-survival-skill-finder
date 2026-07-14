<script setup>
// 純視覺開關：點擊行為由外層容器（如整列按鈕）決定，故不 emit 事件
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="toggle-switch" :class="{ 'is-active': modelValue }">
    <div class="toggle-thumb"></div>
  </div>
</template>

<style scoped>
.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background-color: var(--bg-modifier-hover);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
  flex-shrink: 0;
}

.toggle-switch.is-active {
  background-color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background-color: var(--text-muted);
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-switch.is-active .toggle-thumb {
  transform: translateX(16px);
  background-color: #fff;
  box-shadow: 0 0 8px var(--accent-cyan-glow);
}
</style>
