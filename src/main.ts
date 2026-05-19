import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

// import theo thứ tự để tailwind đầu tiên để có thể bị override bởi các style khác
import './assets/tailwind.css'
// import theo thứ tự để main.scss có thể override các style của tailwind
import './assets/main.scss'
// import theo thứ tự để các style chung của vue có thể override các style của main.scss
import './common/scss/vue-common.scss'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
