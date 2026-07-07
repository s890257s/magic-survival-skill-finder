# Magic Survival 技能查找工具實作計畫

本計畫根據 `spec.md` 的規格需求，並結合 `frontend-design` 與 `ui-ux-pro-max` 的高級前端設計指南，打造一款兼具極致效能與頂級遊戲沉浸感的靜態網頁應用。

## 🎯 核心技術棧
* **框架：** Vue 3 (Composition API) + Vite
* **路由：** Vue Router (處理「圖鑑」與「配技」的視圖切換)
* **樣式：** 原生 CSS (Vanilla CSS) 搭配 CSS Variables 實現深色主題與毛玻璃特效。不依賴 Tailwind 或 Vuetify，以確保 100% 的高質感客製化。
* **資料與狀態：** 直接 `import` 本地的 `skills.json`，使用 `localStorage` 儲存玩家的最愛配技。

---

## 🎨 UI/UX 設計方針 (Premium Aesthetics)

為符合《Magic Survival》的遊戲調性，我們將採用以下視覺風格：

* **主題色彩 (Mystic Dark)：** 
  * 背景以深邃的午夜藍或曜石黑為主 (`#0B0E14`, `#151A22`)。
  * 點綴色（Accent）使用具魔法感的螢光藍 (`#00F0FF`) 或秘術紫 (`#B537F2`)。
* **排版 (Typography)：**
  * 拒絕使用常見的 Arial/Inter。標題將採用具神祕氣息的字體（如 Google Fonts 的 `Outfit` 或 `Cinzel`），內文採用高可讀性的現代字體。
* **視覺元素 (Effects)：**
  * **Glassmorphism (毛玻璃)：** 技能卡片、底部導覽列與下拉選單採用半透明背景 (`rgba(255,255,255,0.05)`) 加上 `backdrop-filter: blur(12px)`，營造懸浮與層次感。
  * **微動畫 (Micro-interactions)：** 卡片 Hover 時有平滑的上浮 (`transform: translateY(-2px)`) 與光暈 (`box-shadow`) 效果；按鈕點擊有縮放回饋。
* **圖示 (Icons)：**
  * 嚴格遵守規範：**絕對不使用 Emoji**。將全面採用 SVG 向量圖示（如 Lucide 或 Heroicons）來維持專業度。

> [!TIP]
> **行動裝置優先設計：**
> 主要導覽介面將放置於畫面底部 (Bottom Navigation Bar)，方便玩家單手操作。過濾器與搜尋框將設計成可收合的 Sticky Header。

---

## 🏗️ 專案架構與組件規劃

### 檔案結構
```text
src/
├── assets/
│   └── main.css          # 全域樣式、CSS 變數、重置樣式
├── components/
│   ├── layout/
│   │   └── BottomNav.vue # 底部導航列
│   ├── ui/
│   │   ├── GlassCard.vue # 毛玻璃卡片基底
│   │   ├── MagicTag.vue  # 標籤組件 (主/副/學派/實驗體)
│   │   ├── FormSelect.vue# 客製化連動下拉選單
│   │   └── Toast.vue     # 視覺提示訊息
│   └── SkillCard.vue     # 融合技能專用展示卡片
├── views/
│   ├── Dictionary.vue    # 圖鑑視圖 (總覽、搜尋、過濾)
│   └── Builder.vue       # 配技視圖 (我的最愛、衝突檢測、匯出)
├── router/
│   └── index.js          # Vue Router 設定
├── data/
│   └── skills.json       # (已就緒)
└── App.vue               # 根組件
```

---

## ⚙️ 核心邏輯設計

### 1. 搜尋與過濾引擎 (`Dictionary.vue`)
* 使用 `computed` 即時運算列表：
  * 解析 `skills.json`，自動提取不重複的 `subject` (實驗體) 與 `school` (學派) 作為下拉選單選項。
  * **精準反查聯動：** 選中「基礎技能 A」後，依據資料自動過濾出對應的「附魔」選項供第二選單使用。
  * 多條件交集過濾（搜尋字串 + 學派 + 實驗體 + 基礎技能）。

### 2. 配技衝突檢測 (`Builder.vue`)
* **資料結構：** `localStorage.getItem('favorite_skills')` (存儲 ID 陣列)。
* **衝突算法：** 
  迴圈遍歷最愛清單中的所有融合技能，提取每個融合技能的 `mainSkill.name` 與 `subSkill.name`。若在不同融合技能中發現相同的基礎技能名稱，即標記為衝突，並在畫面上亮起紅框與 Toast 警告。

### 3. 建構匯出功能
* 將配技清單轉換為 Markdown 或純文字條列，利用瀏覽器的 `navigator.clipboard.writeText()` API 一鍵複製。

---

## 📋 實作步驟

1. **Step 1: 基礎建設 (Infrastructure)**
   * 配置 `vue-router`。
   * 建立 `main.css` 寫入 Design Token (CSS 變數) 與基礎排版。
2. **Step 2: 核心 UI 組件開發**
   * 實作 `BottomNav`、`GlassCard`、`FormSelect`。確保 RWD 手機版完美適配。
3. **Step 3: 圖鑑頁面實作 (Dictionary)**
   * 串接 JSON，完成卡片列表渲染。
   * 實作關鍵字、學派、實驗體篩選，以及精準反查的連動邏輯。
4. **Step 4: 配技頁面實作 (Builder)**
   * 實作 LocalStorage 存取邏輯。
   * 撰寫衝突檢測算法與警告 UI。
   * 完成清單排序與匯出複製功能。
5. **Step 5: 體驗打磨 (Polishing)**
   * 補上過場動畫 (Transition)、Toast 提示系統、測試所有點擊反饋。
