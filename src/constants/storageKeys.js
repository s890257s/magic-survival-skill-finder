// localStorage key 總表：所有持久化 key 集中於此，避免撞名或改名漏改。
// 值維持原字串，既有使用者的資料不受影響。
export const STORAGE_KEYS = {
  favorites: 'favorite_skills',
  savedBuilds: 'saved_builds',
  pinned: 'pinned_skills',
  dictionaryFilters: 'dictionary_filters',
  dictionaryUi: 'dictionary_ui',
  theme: 'theme',
  showEnglish: 'show_english',
  locale: 'app_locale',
}
