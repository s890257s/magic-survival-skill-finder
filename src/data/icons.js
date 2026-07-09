// 圖示例外表：只需列「檔名不符合 snake_case 慣例」的項目。
// 慣例：名稱轉 snake_case 後找同名 .webp（'Electric Shock' → electric_shock.webp），
// 是否真的有圖檔由 src/data/iconManifest.json 決定（npm run icons 重新掃描），
// 沒有圖檔的名稱自動顯示字首色塊佔位圖，不會發出無效請求。
export const iconMap = {
  // public/icons/fusion/ — 融合技能
  fusion: {},
  // public/icons/skills/ — 基礎技能
  skill: {},
  // public/icons/subjects/ — 實驗體
  subject: {},
  // public/icons/schools/ — 學派
  school: {},
}

export const iconDirs = {
  fusion: 'fusion',
  skill: 'skills',
  subject: 'subjects',
  school: 'schools',
}
