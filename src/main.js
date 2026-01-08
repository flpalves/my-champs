import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importações do Bootstrap...
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import './assets/manager-theme.css'
import { createBootstrap } from 'bootstrap-vue-next'

// 1. IMPORTAR A NOVA BIBLIOTECA
import VueGtag from 'vue-gtag-next'

const app = createApp(App)

app.use(router)
app.use(createBootstrap())

// 2. CONFIGURAR O GA4 (Atualizado)
app.use(VueGtag, {
  property: { 
    id: "G-MPEJ549X65", // Coloque seu ID aqui
    params: {
      anonymize_ip: true
    }
  }
});

// A integração automática com o router no vue-gtag-next é feita via trackRouter manual 
// ou apenas deixando ele capturar a mudança de histórico, mas para garantir:
import { trackRouter } from 'vue-gtag-next'
trackRouter(router)

app.mount('#app')