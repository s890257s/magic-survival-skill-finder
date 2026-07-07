// 精簡日期時間（月/日 時:分），供配技存檔顯示
export const formatDate = (ts) =>
  new Date(ts).toLocaleString(undefined, {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
