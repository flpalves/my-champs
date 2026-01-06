import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// Importar CSS do Bootstrap e do BootstrapVueNext
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

import './assets/manager-theme.css'

// Importar o plugin
import { createBootstrap } from 'bootstrap-vue-next'

createApp(App).
use(createBootstrap()).use(store).use(router).mount('#app')
