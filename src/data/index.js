import skillsData from './skills.json'

export { skillsData }

export const skillsById = new Map(skillsData.map(s => [s.id, s]))

const toOptions = (values) => {
  return Array.from(values).sort().map(v => ({ value: v, label: v }))
}

const schools = new Set()
const subjects = new Set()
const bases = new Set()
const enchantsByBase = new Map()

const collectPart = (part) => {
  if (!part?.name) return
  bases.add(part.name)
  if (part.enchant) {
    if (!enchantsByBase.has(part.name)) enchantsByBase.set(part.name, new Set())
    enchantsByBase.get(part.name).add(part.enchant)
  }
}

skillsData.forEach(s => {
  if (s.requirements?.school) schools.add(s.requirements.school)
  if (s.requirements?.subject) subjects.add(s.requirements.subject)
  collectPart(s.mainSkill)
  collectPart(s.subSkill)
})

export const schoolOptions = toOptions(schools)
export const subjectOptions = toOptions(subjects)
export const baseSkillOptions = toOptions(bases)

export const enchantOptionsFor = (baseSkillName) => {
  return toOptions(enchantsByBase.get(baseSkillName) ?? [])
}
