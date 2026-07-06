import { createRouter, createWebHistory } from 'vue-router'
import Dictionary from '../views/Dictionary.vue'
import Builder from '../views/Builder.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
