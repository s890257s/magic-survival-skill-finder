import zhTW from '@/data/zh-TW.json'

export function useI18n() {
  const t = (key) => {
    if (!key) return ''
    return zhTW[key] || key
  }

  return { t }
}
