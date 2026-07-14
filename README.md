# Magic Survival 技能查找工具

[Magic Survival（魔法生存戰）](https://play.google.com/store/apps/details?id=com.nekosgame.MagicSurvival)融合技能查詢與配技模擬工具。純靜態網頁、行動裝置優先，狀態存於瀏覽器 LocalStorage。

完整功能規格見 [docs/spec.md](docs/spec.md)。

## 功能

- **圖鑑**：融合技能總覽，支援中英文關鍵字搜尋、基礎技能／附魔連動反查、實驗體篩選、終極技能過濾，常用組合可釘選優先顯示
- **配技**：加入最愛模擬配技，自動檢測基礎技能衝突、超過格數上限提醒、排序調整、一鍵清空（可復原）、匯出純文字分享
- **體驗**：深淺色主題（預設跟隨系統）、英文名稱顯示切換、觸控優化

## 技術

Vue 3（`<script setup>`）+ Vite + Pinia + Vue Router（hash 模式，可部署於任何靜態子路徑）。

- 技能資料：[src/data/skills.json](src/data/skills.json)，對應遊戲版本記錄於 [src/data/meta.js](src/data/meta.js)
- 圖示：[src/data/icons.js](src/data/icons.js) 為例外對照表，未提供圖檔的項目自動顯示佔位色塊

## 開發

```sh
npm install
npm run dev      # 開發伺服器
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
npm run lint     # ESLint（自動修復）
npm run format   # Prettier 格式化
```
