<script setup>
import { computed, ref, watch } from 'vue'
import { iconMap, iconDirs } from '@/data/icons'
import iconManifest from '@/data/iconManifest.json'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  // 'fusion' | 'ultimate' | 'skill' | 'subject' | 'school'
  category: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: null,
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
  const dir = iconDirs[props.category]
  let file = iconMap[props.category]?.[props.name]

  if (!file) {
    // 慣例檔名：名稱轉 snake_case (例如 'Electric Shock' -> 'electric_shock.webp')
    const snakeCaseName = props.name
      .toLowerCase()
      .replace(/[\s-]+/g, '_')
      .replace(/[^\w_]/g, '')
    file = `${snakeCaseName}.webp`
  }

  // 只對 manifest 中確實存在的圖檔發請求，避免大量 404（manifest 由 npm run icons 產生）
  if (!iconManifest[dir]?.includes(file)) return ''

  return `${import.meta.env.BASE_URL}icons/${dir}/${file}`
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

const styleVars = computed(() => {
  if (props.size != null) {
    const sizeStr = typeof props.size === 'number' ? `${props.size}px` : props.size
    return { '--icon-size': sizeStr }
  }
  return {}
})
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
  vertical-align: middle;
  width: var(--icon-size, 32px);
  height: var(--icon-size, 32px);
  border-radius: calc(var(--icon-size, 32px) * 0.25);
  font-size: calc(var(--icon-size, 32px) * 0.5);
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
