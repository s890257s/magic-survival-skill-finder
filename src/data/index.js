import skillsData from './skills.json'
import { locales, translate } from './locales'

export { skillsData }

export const skillsById = new Map(skillsData.map((s) => [s.id, s]))

const schoolsMap = new Set()
const subjectsMap = new Set()
const basesMap = new Set()
const enchantsByBase = new Map() // baseName -> Set(enchantName)

// 選項排序用固定以繁中為準，確保各語系下順序一致
const t = (key) => translate(locales['zh-TW'], key)

const collectPart = (part) => {
  if (!part?.name) return

  basesMap.add(part.name)

  if (part.enchant) {
    if (!enchantsByBase.has(part.name)) {
      enchantsByBase.set(part.name, new Set())
    }
    enchantsByBase.get(part.name).add(part.enchant)
  }
}

// 預組搜尋字串：包含所有語系翻譯與英文 Key (全語系混合搜尋)
// 注意：searchText 是啟動時直接掛到 skills.json 物件上的衍生欄位，json 檔本身沒有
skillsData.forEach((s) => {
  const parts = new Set()

  const addParts = (key) => {
    if (!key) return
    parts.add(key)
    Object.values(locales).forEach((dict) => parts.add(translate(dict, key)))
  }

  addParts(s.name)
  addParts(s.mainSkill?.name)
  addParts(s.mainSkill?.enchant)
  addParts(s.subSkill?.name)
  addParts(s.subSkill?.enchant)

  if (s.requirements?.ultimate) {
    addParts(s.requirements.ultimate)
  }

  s.searchText = Array.from(parts)
    .filter(Boolean)
    .join('\n')
    .toLowerCase()
})

skillsData.forEach((s) => {
  if (s.requirements?.school) {
    schoolsMap.add(s.requirements.school)
  }
  if (s.requirements?.subject) {
    subjectsMap.add(s.requirements.subject)
  }
  collectPart(s.mainSkill)
  collectPart(s.subSkill)
})

const toOptions = (setObj) => {
  return Array.from(setObj)
    .sort((a, b) => t(a).localeCompare(t(b), 'zh-TW'))
    .map((val) => ({
      value: val,
      label: val, // We will translate this in the UI
    }))
}

export const schoolOptions = toOptions(schoolsMap)
export const subjectOptions = toOptions(subjectsMap)
export const baseSkillOptions = toOptions(basesMap)

export const enchantOptionsFor = (baseSkillName) => {
  const enchantSet = enchantsByBase.get(baseSkillName)
  if (!enchantSet) return []
  return toOptions(enchantSet)
}
