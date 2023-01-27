import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { SetupCalendar } from 'v-calendar';

createApp(App)
    .use(store)
    .use(router)
    .use(SetupCalendar, {})
    .mount('#app')
