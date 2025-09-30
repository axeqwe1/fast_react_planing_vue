import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './style.css'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
const app = createApp(App)

app.use(createPinia())
app.use(FloatingVue)
app.use(router)
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    ripple: false, // ปิด ripple
    preset: Aura,
  },
})

app.mount('#app')
