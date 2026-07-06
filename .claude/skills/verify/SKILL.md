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

## 注意
- headless Chrome 的 prefers-color-scheme 預設是 light，初始主題會是淺色
- 狀態存 LocalStorage（`favorite_skills`、`theme`），可用 `page.addInitScript` 預先種資料
