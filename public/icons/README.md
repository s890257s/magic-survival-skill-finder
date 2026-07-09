# 遊戲圖示放置說明

補圖流程（兩步）：

1. 把圖檔丟進對應資料夾（建議 64x64 以上的正方形 webp）：

   | 資料夾 | 內容 |
   |---|---|
   | `fusion/` | 融合技能 |
   | `skills/` | 基礎技能 |
   | `subjects/` | 實驗體 |
   | `schools/` | 學派 |

   檔名慣例：遊戲英文名稱轉 snake_case（`Electric Shock` → `electric_shock.webp`）。
   符合慣例就不用改任何程式碼；檔名不符合慣例時，才到 `src/data/icons.js`
   的對應分類加一行 `'遊戲內名稱': '檔名（含副檔名）'`。

2. 執行 `npm run icons` 重新產生 `src/data/iconManifest.json`
   （`npm run dev` / `npm run build` 前也會自動執行）。

沒有圖檔的名稱會自動顯示字首色塊佔位圖，不會破版、也不會發出無效請求。
