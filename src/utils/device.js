// 桌機寬度判斷（與 CSS 768px 斷點一致）：
// 手機不自動聚焦輸入框，避免彈出鍵盤遮擋畫面
export const isDesktopWidth = () => window.innerWidth >= 768
