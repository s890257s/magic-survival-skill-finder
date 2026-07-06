import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import globals from 'globals'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // 小型單頁工具：view / 全域 UI 元件採單字命名（Dictionary、Builder、Toast）
      'vue/multi-word-component-names': 'off',
    },
  },
  // 排版交給 Prettier，關閉與其衝突的格式規則
  skipFormatting,
]
