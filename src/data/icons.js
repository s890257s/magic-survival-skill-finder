// 圖示例外表：只列「已經有圖檔」的項目，其餘名稱自動顯示字首色塊佔位圖。
// 拿到新圖時：把檔案丟進 public/icons/<分類資料夾>/，再到對應分類加一行
//   '遊戲內名稱': '檔名（含副檔名）'
// 例：fusion 的 '放電': 'discharge.webp' → 讀取 public/icons/fusion/discharge.webp
export const iconMap = {
  // public/icons/fusion/ — 融合技能
  fusion: {},
  // public/icons/skills/ — 基礎技能
  skill: {
    // 示範項目：拿到真圖後直接替換 public/icons/skills/ 下的檔案即可
    Thunderstorm: 'sample-lightning.png',
  },
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
