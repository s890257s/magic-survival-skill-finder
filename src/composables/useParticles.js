import { ref } from 'vue'

const particles = ref([])
let nextId = 1

export function useParticles() {
  const spawnParticle = (startX, startY, endX, endY, iconName) => {
    const id = nextId++
    particles.value.push({
      id,
      startX,
      startY,
      endX,
      endY,
      iconName
    })
    
    // Safety fallback: if particle component fails to remove itself, remove it after animation
    setTimeout(() => {
      removeParticle(id)
    }, 1000)
  }

  const removeParticle = (id) => {
    const index = particles.value.findIndex(p => p.id === id)
    if (index !== -1) {
      particles.value.splice(index, 1)
    }
  }

  return {
    particles,
    spawnParticle,
    removeParticle
  }
}
