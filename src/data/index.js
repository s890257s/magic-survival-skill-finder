import skillsData from './skills.json'
import zhTW from './zh-TW.json'

export { skillsData }

export const skillsById = new Map(skillsData.map((s) => [s.id, s]))

const schoolsMap = new Set()
const subjectsMap = new Set()
const basesMap = new Set()
const enchantsByBase = new Map() // baseName -> Set(enchantName)

const t = (key) => zhTW[key] || key

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

// 預組搜尋字串：包含英文 Key 與翻譯後的中文名稱
skillsData.forEach((s) => {
  const parts = [
    s.name, t(s.name),
    s.mainSkill?.name, t(s.mainSkill?.name),
    s.mainSkill?.enchant, t(s.mainSkill?.enchant),
    s.subSkill?.name, t(s.subSkill?.name),
    s.subSkill?.enchant, t(s.subSkill?.enchant),
  ]
  s.searchText = parts
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
