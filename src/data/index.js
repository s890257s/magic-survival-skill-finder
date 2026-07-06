import skillsData from './skills.json'

export { skillsData }

export const skillsById = new Map(skillsData.map(s => [s.id, s]))

const schoolsMap = new Map()
const subjectsMap = new Map()
const basesMap = new Map()
const enchantsByBase = new Map() // baseName -> Map(enchantName -> enEnchant)

const collectPart = (part) => {
  if (!part?.name) return
  
  if (!basesMap.has(part.name) || !basesMap.get(part.name)) {
    basesMap.set(part.name, part.enName || '')
  }

  if (part.enchant) {
    if (!enchantsByBase.has(part.name)) {
      enchantsByBase.set(part.name, new Map())
    }
    const enchantMap = enchantsByBase.get(part.name)
    if (!enchantMap.has(part.enchant) || !enchantMap.get(part.enchant)) {
      enchantMap.set(part.enchant, part.enEnchant || '')
    }
  }
}

skillsData.forEach(s => {
  if (s.requirements?.school) {
    if (!schoolsMap.has(s.requirements.school) || !schoolsMap.get(s.requirements.school)) {
      schoolsMap.set(s.requirements.school, s.requirements.schoolEn || '')
    }
  }
  if (s.requirements?.subject) {
    if (!subjectsMap.has(s.requirements.subject) || !subjectsMap.get(s.requirements.subject)) {
      subjectsMap.set(s.requirements.subject, s.requirements.subjectEn || '')
    }
  }
  collectPart(s.mainSkill)
  collectPart(s.subSkill)
})

const toOptions = (mapObj) => {
  return Array.from(mapObj.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([val, enVal]) => ({
      value: val,
      label: val,
      enLabel: enVal
    }))
}

export const schoolOptions = toOptions(schoolsMap)
export const subjectOptions = toOptions(subjectsMap)
export const baseSkillOptions = toOptions(basesMap)

export const enchantOptionsFor = (baseSkillName) => {
  const enchantMap = enchantsByBase.get(baseSkillName)
  if (!enchantMap) return []
  return toOptions(enchantMap)
}
