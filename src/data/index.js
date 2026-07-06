import skillsData from './skills.json'

export { skillsData }

export const skillsById = new Map(skillsData.map(s => [s.id, s]))

export const enDict = {
  "魔力彈": "Magic Bolt",
  "火焰球": "Fireball",
  "落雷": "Thunderstorm",
  "隕石墜落": "Meteor",
  "旋風": "Cyclone",
  "電氣衝擊": "Electric Shock",
  "能量彈": "Energy Bolt",
  "焚燒": "Incineration",
  "暴風雪": "Blizzard",
  "海嘯": "Tsunami",
  "精靈": "Spirit",
  "衛星": "Satellite",
  "幻視光線": "Arcane Ray",
  "導電地帶": "Electric Zone",
  "凜霜": "Frost Nova",
  "熔岩地帶": "Lava Zone",
  "護盾": "Shield",
  "急行": "Cloaking",
  "魔法陣": "Magic Circle",
  "末日審判": "Armageddon",
  "閃光衝擊": "Flash Shock",
  "智力": "Intelligence",
  "魔力發散": "Magic Release",
  "集中": "Concentration",
  "天文學者": "Astronomer",
  "火焰術士": "Pyromancer",
  "召喚師": "Summoner",
  "冰凍師": "Frost Mage",
  "巫術師": "Warlock",
  "協調者": "Arbitrator",
  "咒術師": "Shaman",
  "神秘術士": "Mystic",
  "術士": "Magician",
  "傑克燈籠": "Jack-o-lantern",
  "煉金術士": "Alchemist",
  "電荷術士": "Electromancer",
  "德魯伊": "Druid",
  "戰爭領主": "Warlord",
  "戰鬥法師": "Battle Mage",
  "魔女": "Witch",
  "魔法師": "Wizard",
  "魔學者": "Scholar",
  "高功率": "High Power",
  "閃電爆炸": "Lightning Explosion",
  "怪火": "Will-o'-the-wisp",
  "魔力刀刃": "Magic Blade",
  "極點": "Pole",
  "冰河期": "Ice Age",
  "殲滅": "Annihilation",
  "被提": "Rapture",
  "破壞光線": "Destruction Ray",
  "使魔": "Familiar",
  "電荷排放": "Discharge",
  "破壞場": "Destruction Field",
  "噴火口": "Crater",
  "核融合": "Nuclear Fusion",
  "縱火狂": "Pyromaniac",
  "火災": "Blaze",
  "閃焰": "Flare",
  "審判": "Judgment",
  "小行星": "Asteroid",
  "流星": "Shooting Star",
  "星座": "Constellation",
  "虛無": "Void",
  "大噴發": "Eruption",
  "超導": "Superconductivity",
  "火焰猛擊": "Flame Strike",
  "毒氣": "Poison Gas",
  "亂射": "Spray",
  "反重力": "Anti-Gravity",
  "諸神黃昏": "Ragnarok",
  "魔法導彈": "Magic Missile",
  "爆竹": "Firecracker",
  "火山爆炸": "Volcanic Eruption",
  "地獄三頭犬之焰": "Cerberus Flame",
  "空間扭曲": "Space Distortion",
  "極端天氣": "Extreme Weather",
  "火之光環": "Fire Aura",
  "連鎖閃電": "Chain Lightning",
  "帶電粒子": "Charged Particles",
  "分身": "Doppelganger",
  "地震": "Earthquake",
  "反射": "Reflection",
  "賽蓮之歌": "Siren's Song",
  "岩漿噴湧": "Magma Eruption",
  "晴天霹靂": "Thunderbolt",
  "嚴寒期": "Severe Cold",
  "電氣球": "Electric Ball",
  "惡魔利爪": "Demon's Claw",
  "大爆炸": "Big Bang",
  "流星雨": "Meteor Shower",
  "電磁放射": "Electromagnetic Emission",
  "大魔法陣": "Great Magic Circle",
  "EMP": "EMP",
  "物質彈性": "Material Transmutation",
  "融解": "Melting",
  "魔力箭矢": "Magic Arrow"
}

const toOptions = (values) => {
  return Array.from(values).sort().map(v => ({ 
    value: v, 
    label: v,
    enLabel: enDict[v] || ''
  }))
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
