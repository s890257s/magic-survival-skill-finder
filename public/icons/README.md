# 遊戲圖示放置說明

補圖流程（兩步）：

1. 把圖檔丟進對應資料夾（建議 64x64 以上的正方形 webp/png）：

   | 資料夾 | 內容 |
   |---|---|
   | `fusion/` | 融合技能 |
   | `skills/` | 基礎技能 |
   | `subjects/` | 實驗體 |
   | `schools/` | 學派 |

2. 打開 `src/data/icons.js`，把對應名稱的 `null` 改成「檔名（含副檔名）」：

   ```js
   skill: {
     '落雷': 'lightning.webp',  // → 讀取 public/icons/skills/lightning.webp
   }
   ```

沒填（`null`）或圖檔載入失敗時，UI 會自動顯示字首色塊佔位圖，不會破版。
