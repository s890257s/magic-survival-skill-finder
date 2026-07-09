import rawSkills from './skills.json'
import { locales, translate } from './locales'

// 預組搜尋字串：包含所有語系翻譯與英文 Key（全語系混合搜尋）。
// 以複本掛上衍生欄位，維持 skills.json 原始物件不被改寫。
const buildSearchText = (skill) => {
  const parts = new Set()

  const addParts = (key) => {
    if (!key) return
    parts.add(key)
    Object.values(locales).forEach((dict) => parts.add(translate(dict, key)))
  }

  addParts(skill.name)
  addParts(skill.mainSkill?.name)
  addParts(skill.mainSkill?.enchant)
  addParts(skill.subSkill?.name)
  addParts(skill.subSkill?.enchant)
  addParts(skill.requirements?.ultimate)

  return Array.from(parts).filter(Boolean).join('\n').toLowerCase()
}

export const skillsData = rawSkills.map((s) => ({ ...s, searchText: buildSearchText(s) }))

export const skillsById = new Map(skillsData.map((s) => [s.id, s]))

// --- 篩選選項（名稱字串陣列；顯示文字由 UI 端 t() 翻譯） ---

const schools = new Set()
const subjects = new Set()
const bases = new Set()
const enchantsByBase = new Map() // baseName -> Set(enchantName)

const collectPart = (part) => {
  if (!part?.name) return

  bases.add(part.name)

  if (part.enchant) {
    if (!enchantsByBase.has(part.name)) {
      enchantsByBase.set(part.name, new Set())
    }
    enchantsByBase.get(part.name).add(part.enchant)
  }
}

skillsData.forEach((s) => {
  if (s.requirements?.school) {
    schools.add(s.requirements.school)
  }
  if (s.requirements?.subject) {
    subjects.add(s.requirements.subject)
  }
  collectPart(s.mainSkill)
  collectPart(s.subSkill)
})

// 選項排序固定以繁中為準，確保各語系下順序一致
const t = (key) => translate(locales['zh-TW'], key)
const toSortedNames = (setObj) => Array.from(setObj).sort((a, b) => t(a).localeCompare(t(b), 'zh-TW'))

export const schoolOptions = toSortedNames(schools)
export const subjectOptions = toSortedNames(subjects)
export const baseSkillOptions = toSortedNames(bases)

export const enchantOptionsFor = (baseSkillName) => {
  const enchantSet = enchantsByBase.get(baseSkillName)
  if (!enchantSet) return []
  return toSortedNames(enchantSet)
}
