import '@/assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'

import { vFocus } from '@/utils/directives'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.directive('focus', vFocus)

app.mount('#app')
