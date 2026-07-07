import { ref } from 'vue'
import { locales, translate } from '@/data/locales'

const LOCALE_KEY = 'app_locale'
// 全域狀態，確保切換時所有元件一起響應
const currentLocale = ref(localStorage.getItem(LOCALE_KEY) || 'zh-TW')

export function useI18n() {
  const setLocale = (lang) => {
    currentLocale.value = lang
    localStorage.setItem(LOCALE_KEY, lang)
  }

  // t(key, ...args)：查字典後以 {0}、{1}… 依序插值
  const t = (key, ...args) => {
    if (!key) return ''
    const dict = locales[currentLocale.value] || locales['zh-TW']
    return args.reduce((str, arg, i) => str.replaceAll(`{${i}}`, arg), translate(dict, key))
  }

  return { locale: currentLocale, setLocale, t }
}
