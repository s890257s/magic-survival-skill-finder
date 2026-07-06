import { createRouter, createWebHashHistory } from 'vue-router'
import Dictionary from '../views/Dictionary.vue'
import Builder from '../views/Builder.vue'

const router = createRouter({
  // hash 模式：純靜態主機（GitHub Pages 等）直接整理/分享子頁連結不會 404
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dictionary',
      component: Dictionary
    },
    {
      path: '/builder',
      name: 'builder',
      component: Builder
    }
  ],
})

export default router
