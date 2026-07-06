<script setup>
import { computed, ref, watch } from 'vue'
import { iconMap, iconDirs } from '@/data/icons'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  // 'fusion' | 'skill' | 'subject' | 'school'
  category: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 32,
  },
})

// 圖檔載入失敗時退回佔位圖（對照表填了但檔案不存在）
const loadFailed = ref(false)
watch(
  () => [props.name, props.category],
  () => {
    loadFailed.value = false
  },
)

const src = computed(() => {
  const file = iconMap[props.category]?.[props.name]
  if (!file) return null
  return `${import.meta.env.BASE_URL}icons/${iconDirs[props.category]}/${file}`
})

const showImage = computed(() => src.value && !loadFailed.value)

// 佔位圖：名稱 hash 決定色相（同名永遠同色）
const hue = computed(() => {
  let h = 0
  for (const ch of props.name) {
    h = (h * 31 + ch.codePointAt(0)) % 360
  }
  return h
})

const styleVars = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: `${Math.round(props.size * 0.25)}px`,
  fontSize: `${Math.round(props.size * 0.5)}px`,
}))
</script>

<template>
  <img
    v-if="showImage"
    :src="src"
    :alt="name"
    class="game-icon"
    :style="styleVars"
    loading="lazy"
    @error="loadFailed = true"
  />
  <span
    v-else
    class="game-icon placeholder"
    :style="{ ...styleVars, backgroundColor: `hsl(${hue}, 55%, 50%)` }"
    :aria-label="name"
  >
    {{ name.charAt(0) }}
  </span>
</template>

<style scoped>
.game-icon {
  flex-shrink: 0;
  object-fit: cover;
  display: inline-flex;
}

.placeholder {
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  line-height: 1;
  user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
