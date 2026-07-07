import skillsData from './skills.json'
import zhTW from './zh-TW.json'
import zhCN from './zh-CN.json'
import en from './en.json'

export { skillsData }

export const skillsById = new Map(skillsData.map((s) => [s.id, s]))

const schoolsMap = new Set()
const subjectsMap = new Set()
const basesMap = new Set()
const enchantsByBase = new Map() // baseName -> Set(enchantName)

const t_tw = (key) => zhTW[key] || key
const t_cn = (key) => zhCN[key] || key
const t_en = (key) => en[key] || key

// Provide a default t for sorting options (fallback to tw)
const t = t_tw

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
skillsData.forEach((s) => {
  const parts = new Set()
  
  const addParts = (key) => {
    if (!key) return
    parts.add(key)
    parts.add(t_tw(key))
    parts.add(t_cn(key))
    parts.add(t_en(key))
  }

  addParts(s.name)
  addParts(s.mainSkill?.name)
  addParts(s.mainSkill?.enchant)
  addParts(s.subSkill?.name)
  addParts(s.subSkill?.enchant)

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
