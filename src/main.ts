import Aura from '@primevue/themes/aura';
import { createPinia } from 'pinia';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import './assets/base.css';
import { useDictionaryService } from './composables/dictionary.service';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app
  .use(createPinia())
  .use(router)
  .use(PrimeVue, {
    theme: { preset: Aura },
  })
  .use(ToastService);

const initializeApp = async () => {
  try {
    const dictionaryService = useDictionaryService();
    await dictionaryService.initialPageLoad();
    console.log('✅ Dictionary data initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize dictionary data:', error);
  }
};

app.mount('#app');

initializeApp();
