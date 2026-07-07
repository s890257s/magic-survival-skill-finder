import zhTW from './zh-TW.json'
import zhCN from './zh-CN.json'
import en from './en.json'

// 語系字典總表：useI18n 與 data/index.js 共用，避免兩套查找邏輯
export const locales = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
}

// 查字典，查無則退回 key 本身
export const translate = (dict, key) => dict[key] || key
