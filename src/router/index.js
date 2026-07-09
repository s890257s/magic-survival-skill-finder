import { createRouter, createWebHashHistory } from 'vue-router'
import Dictionary from '@/views/Dictionary.vue'

const router = createRouter({
  // hash 模式：純靜態主機（GitHub Pages 等）直接整理/分享子頁連結不會 404
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dictionary',
      component: Dictionary,
    },
    {
      path: '/builder',
      redirect: to => {
        return { path: '/', query: to.query }
      }
    },
  ],
})

export default router
