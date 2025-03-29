import { createHead } from '@vueuse/head';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import Styleclass from 'primevue/styleclass';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';
import './assets/styles/main.css';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

const head = createHead();
app.use(head);

// Đăng ký directive styleclass
app.directive('styleclass', Styleclass);

app.mount('#app');
