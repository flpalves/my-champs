<template>
  <div class="container mt-4">
    <h2 class="mb-4 text-center">Tabela do Campeonato</h2>

    <BTableSimple hover striped responsive bordered>
      <BThead variant="dark">
        <BTr>
          <BTh>#</BTh>
          <BTh>Time</BTh>
          <BTh>P</BTh>
          <BTh>J</BTh>
          <BTh>V</BTh>
          <BTh>E</BTh>
          <BTh>D</BTh>
          <BTh>SG</BTh>
        </BTr>
      </BThead>
      <BTbody>
        <BTr v-for="(time, index) in timesOrdenados" :key="time.id">
          <BTd>{{ index + 1 }}º</BTd>
          <BTd class="fw-bold">{{ time.nome }}</BTd>
          <BTd class="table-active fw-bold">{{ time.pontos }}</BTd>
          <BTd>{{ time.jogos }}</BTd>
          <BTd>{{ time.vitorias }}</BTd>
          <BTd>{{ time.empates }}</BTd>
          <BTd>{{ time.derrotas }}</BTd>
          <BTd>{{ time.saldoGols }}</BTd>
        </BTr>
      </BTbody>
    </BTableSimple>

    <div class="mt-3 text-end">
      <BButton variant="primary" @click="adicionarVitoriaAleatoria">
        Simular Vitória Aleatória
      </BButton>
    </div>
  </div>
</template>

<script>
// 1. Importação explícita dos componentes necessários
import { 
  BTableSimple, 
  BThead, 
  BTbody, 
  BTr, 
  BTh, 
  BTd, 
  BButton 
} from 'bootstrap-vue-next'

export default {
  name: 'TabelaCampeonato',
  
  // 2. Registro local dos componentes
  components: {
    BTableSimple,
    BThead,
    BTbody,
    BTr,
    BTh,
    BTd,
    BButton
  },

  data() {
    return {
      times: [
        { id: 1, nome: 'Vue United', pontos: 10, jogos: 5, vitorias: 3, empates: 1, derrotas: 1, saldoGols: 5 },
        { id: 2, nome: 'React City', pontos: 8, jogos: 5, vitorias: 2, empates: 2, derrotas: 1, saldoGols: 2 },
        { id: 3, nome: 'Angular FC', pontos: 12, jogos: 5, vitorias: 4, empates: 0, derrotas: 1, saldoGols: 7 },
        { id: 4, nome: 'Svelte Rovers', pontos: 4, jogos: 5, vitorias: 1, empates: 1, derrotas: 3, saldoGols: -4 },
      ]
    }
  },

  computed: {
    timesOrdenados() {
      return [...this.times].sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias
        return b.saldoGols - a.saldoGols
      })
    }
  },

  methods: {
    adicionarVitoriaAleatoria() {
      const indiceAleatorio = Math.floor(Math.random() * this.times.length)
      const time = this.times[indiceAleatorio]
      
      time.pontos += 3
      time.vitorias += 1
      time.jogos += 1
      time.saldoGols += 1
    }
  }
}
</script>