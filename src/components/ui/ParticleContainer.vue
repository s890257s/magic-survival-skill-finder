<script setup>
import { useParticles } from '@/composables/useParticles'
import FlyingParticle from './FlyingParticle.vue'

const { particles } = useParticles()
</script>

<template>
  <Teleport to="body">
    <FlyingParticle 
      v-for="p in particles" 
      :key="p.id" 
      :particle="p" 
    />
  </Teleport>
</template>
