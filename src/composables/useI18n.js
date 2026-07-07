import { ref } from 'vue'
import zhTW from '@/data/zh-TW.json'
import zhCN from '@/data/zh-CN.json'

const LOCALE_KEY = 'app_locale'
// 全域狀態，確保切換時所有元件一起響應
const currentLocale = ref(localStorage.getItem(LOCALE_KEY) || 'zh-TW')

export function useI18n() {
  const setLocale = (lang) => {
    currentLocale.value = lang
    localStorage.setItem(LOCALE_KEY, lang)
  }

  const t = (key) => {
    if (!key) return ''
    if (currentLocale.value === 'en') return key
    if (currentLocale.value === 'zh-CN') return zhCN[key] || key
    return zhTW[key] || key
  }

  return { locale: currentLocale, setLocale, t }
}
