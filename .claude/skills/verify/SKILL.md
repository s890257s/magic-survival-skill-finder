---
name: verify
description: 驗證 magic-survival-skill-finder 的變更——啟動 dev server 並用本機 Chrome + playwright-core 驅動實際流程
---

# 驗證流程

## 啟動
```powershell
npm run dev   # Vite, http://localhost:5173（背景執行）
```

## 驅動（無需安裝瀏覽器）
本機已有 Chrome：`C:/Program Files/Google/Chrome/Application/chrome.exe`。
在 scratchpad `npm i playwright-core`，用 `chromium.launch({ executablePath: CHROME, headless: true })`，viewport 390x844（行動優先）。

## 值得跑的流程
- 圖鑑 `/`：`.skill-card` 數量（全量 62）、`.result-count` 筆數、`.tag-gold` 終極技能標籤（24 筆）
- 學派篩選要包含通用技能（選火焰術士 → 40 筆，不是 3 筆）
- 點卡片上 `.formula-value.clickable` → 反查 + `.filter-chip` 出現
- 按愛心 → 全域 toast（衝突時 warning）、BottomNav `.badge` 數字
- `/builder`：`.slot-count`（超過 3 變紅）、`.banner`、`.conflict-detail`、`.reorder-btn` 排序後 reload 驗證 LocalStorage 持久化
- 清空 → toast 的「復原」按鈕可還原
- `.theme-toggle` 切換 `data-theme`，reload 後保持

- 圖示系統：`.game-icon.placeholder`（字首色塊）vs `img.game-icon`（真圖）；對照表在 `src/data/icons.js`，圖檔在 `public/icons/{fusion,skills,subjects,schools}/`。錯誤 fallback 可用 `page.route(...abort)` 驗證
- 篩選下拉是自訂元件（IconSelect，Teleport 到 body）：trigger `.icon-select .select-trigger`、面板 `.select-panel`、選項 `.option`；Esc / 外點可關閉；截圖前等 fade-in（~200ms）完成否則會拍到半透明中間幀

## 注意
- 路由是 hash 模式：配技頁在 `/#/builder`，導覽連結 selector 是 `a[href="#/builder"]`
- 主題初始值由 index.html 的 inline script 決定（在 CSS 生效前），theme store 只接手後續切換
- headless Chrome 的 prefers-color-scheme 預設是 light，初始主題會是淺色
- 狀態存 LocalStorage（`favorite_skills`、`theme`），可用 `page.addInitScript` 預先種資料
