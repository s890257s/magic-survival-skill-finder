<script setup>
import { computed } from 'vue'
import DictionaryHeader from '@/components/dictionary/DictionaryHeader.vue'
import DictionaryFilterPanel from '@/components/dictionary/DictionaryFilterPanel.vue'
import DictionaryResultBar from '@/components/dictionary/DictionaryResultBar.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  resultCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const search = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <header class="header">
    <DictionaryHeader v-model="search" />
    <DictionaryFilterPanel />
    <DictionaryResultBar :resultCount="resultCount" />
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: var(--bg-dark);
  padding: 16px;
  border-bottom: 1px solid var(--glass-border);
  transition: background-color 0.3s ease;
}
</style>
