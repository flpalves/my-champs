import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TabelaCampeonato from '@/views/TabelaCampeonato.vue'
import CadastroTime from '@/views/CadastroTime.vue'
import ListaClubes from '@/views/ListaClubes.vue'
import EditarTime from '@/views/EditarTime.vue'
import CadastroCampeonato from '@/views/CadastroCampeonato.vue'
import ListaCampeonatos from '@/views/ListaCampeonatos.vue'
import DetalhesCampeonato from '@/views/DetalhesCampeonato.vue'
import TabelaClassificacao from '@/views/TabelaClassificacao.vue'
import SumulaJogo from '@/views/SumulaJogo.vue'
import ArtilhariaCampeonato from '@/views/ArtilhariaCampeonato.vue'
import Configuracoes from '@/views/Configuracoes.vue'
import Sobre from '@/views/Sobre.vue'
import ComoFunciona from '@/views/ComoFunciona.vue'
import RelatorioImpressao from '@/views/RelatorioImpressao.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/tabela',
    name: 'TabelaCampeonato',
    component: TabelaCampeonato
  },
  {
    path: '/novo-time',
    name: 'CadastroTime',
    component: CadastroTime
  },
  {
    path: '/lista-clubes',
    name: 'ListaClubes',
    component: ListaClubes
  },
  {
    path: '/editar-clube/:idTime',
    name: 'EditarTime',
    component: EditarTime
  },
  {
    path: '/novo-campeonato',
    name: 'CadastroCampeonato',
    component: CadastroCampeonato
  },
  {
    path: '/lista-campeonatos',
    name: 'ListaCampeonatos',
    component: ListaCampeonatos
  },
  {
    path: '/campeonato/:id',
    name: 'DetalhesCampeonato',
    component: DetalhesCampeonato
  },
  {
    path: '/campeonato/:id/classificacao',
    name: 'ClassificacaoCampeonato',
    component: TabelaClassificacao,
    props: true
  },
  {
    path: '/campeonato/:idCampeonato/jogo/:idJogo',
    name: 'SumulaJogo',
    component: SumulaJogo
  },
  {
    path: '/campeonato/:id/artilharia',
    name: ArtilhariaCampeonato,
    component: ArtilhariaCampeonato
  },
  {
    path: '/configuracoes',
    name: 'Configuracoes',
    component: Configuracoes
  },
  {
    path: '/sobre',
    name: 'Sobre',
    component: Sobre
  },
  {
    path: '/como-funciona',
    name: 'ComoFunciona',
    component: ComoFunciona
  },
  {
    path: '/campeonato/:id/imprimir',
    name: 'RelatorioImpressao',
    component: RelatorioImpressao
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
