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
import Tooltip from 'primevue/tooltip';

// Import PrimeVue components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
// LƯU Ý: Component Calendar đã lỗi thời từ phiên bản v4, nên thay thế bằng DatePicker
import Calendar from 'primevue/calendar';
import Select from 'primevue/select';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Chart from 'primevue/chart';

// Import ChartJS plugins
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart as ChartJS } from 'chart.js';

// Register ChartJS plugins
ChartJS.register(ChartDataLabels);

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

// Đăng ký directive
app.directive('styleclass', Styleclass);
app.directive('tooltip', Tooltip);

// Register PrimeVue components globally
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Dialog', Dialog);
app.component('Password', Password);
app.component('Checkbox', Checkbox);
app.component('Calendar', Calendar);
app.component('Select', Select);
app.component('Dropdown', Select);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Textarea', Textarea);
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('Chart', Chart);

const head = createHead();
app.use(head);

app.mount('#app');
