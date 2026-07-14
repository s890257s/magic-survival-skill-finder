<script setup>
import { onMounted, ref } from 'vue'
import GameIcon from '@/components/ui/GameIcon.vue'
import { useParticles } from '@/composables/useParticles'

const { removeParticle } = useParticles()

const props = defineProps({
  particle: {
    type: Object,
    required: true
  }
})

const el = ref(null)

onMounted(() => {
  if (!el.value) return

  const { startX, startY, endX, endY } = props.particle

  const animation = el.value.animate(
    [
      { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1 },
      { transform: `translate(${endX}px, ${endY}px) scale(0.3)`, opacity: 0 },
    ],
    {
      duration: 600,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      fill: 'forwards',
    },
  )

  animation.onfinish = () => {
    removeParticle(props.particle.id)
  }
})
</script>

<template>
  <div ref="el" class="flying-particle">
    <GameIcon :name="particle.iconName" category="fusion" />
  </div>
</template>

<style scoped>
.flying-particle {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  /* 與技能卡 icon 同尺寸，讓飛行動畫看起來是同一顆 icon */
  --icon-size: 32px;
  width: var(--icon-size);
  height: var(--icon-size);
  margin-top: calc(var(--icon-size) / -2);
  margin-left: calc(var(--icon-size) / -2);
  filter: drop-shadow(0 0 10px rgba(187, 134, 252, 0.8));
}
</style>
