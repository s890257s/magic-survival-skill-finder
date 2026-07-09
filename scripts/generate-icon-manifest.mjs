// 掃描 public/icons/ 產生 src/data/iconManifest.json，
// 讓 GameIcon 只對「確實存在」的圖檔發出請求，其餘直接顯示佔位圖。
// 新增圖檔後執行 `npm run icons`（dev / build 前也會自動執行）。
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconsRoot = join(root, 'public', 'icons')
const outFile = join(root, 'src', 'data', 'iconManifest.json')

const IMAGE_EXT = /\.(webp|png|jpg|jpeg|gif|svg)$/i
const DIRS = ['fusion', 'ultimate', 'skills', 'subjects', 'schools']

const manifest = {}
for (const dir of DIRS) {
  let files = []
  try {
    files = readdirSync(join(iconsRoot, dir)).filter((f) => IMAGE_EXT.test(f))
  } catch {
    // 資料夾尚未建立：視為無圖檔
  }
  manifest[dir] = files.sort()
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n')

const total = Object.values(manifest).reduce((n, list) => n + list.length, 0)
console.log(`iconManifest.json updated: ${total} files (${DIRS.map((d) => `${d}:${manifest[d].length}`).join(', ')})`)
