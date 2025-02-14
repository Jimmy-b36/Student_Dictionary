import Aura from '@primevue/themes/aura'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { createApp } from 'vue'
import './assets/base.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: { preset: Aura }
  })
  .use(ToastService)

app.mount('#app')
