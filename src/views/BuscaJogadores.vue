<template>
  <div class="container mt-4 mb-5">
    <h2 class="text-primary fw-bold mb-4">🔎 Scout Global <small class="text-muted fs-6">Banco de Talentos</small></h2>

    <BCard class="shadow-sm border-secondary bg-dark text-white mb-4">
      <div class="d-flex gap-2">
        <BFormInput v-model="termoBusca" placeholder="Digite o nome do jogador..." size="lg" class="bg-secondary text-white border-secondary" autofocus />
      </div>
      <div class="mt-2 text-muted small" v-if="!carregando">
        {{ totalJogadores }} jogadores cadastrados no banco de dados.
      </div>
    </BCard>

    <div v-if="carregando" class="text-center py-5">
      <BSpinner variant="primary" />
    </div>

    <div v-else>
      <div v-if="jogadoresFiltrados.length === 0 && termoBusca.length > 0" class="text-center text-muted py-5">
        Nenhum jogador encontrado com "{{ termoBusca }}".
      </div>

      <div class="row">
        <div class="col-md-6 col-lg-4 mb-3" v-for="jogador in jogadoresFiltrados" :key="jogador.uid">
          <div class="card h-100 bg-dark border-secondary shadow-sm hover-card" @click="abrirDetalhes(jogador)" style="cursor: pointer;">
            <div class="card-body d-flex align-items-center">
              <div class="position-relative me-3">
                <div class="avatar-circle bg-secondary d-flex align-items-center justify-content-center fw-bold fs-4 text-white" 
                     :class="getCorOverall(jogador.overall)">
                  {{ jogador.overall || '?' }}
                </div>
              </div>
              
              <div class="flex-grow-1 overflow-hidden">
                <h5 class="card-title text-white mb-1 text-truncate">{{ jogador.nome }}</h5>
                <div class="d-flex align-items-center text-muted small">
                  <img :src="jogador.timeEscudo" width="18" height="18" class="me-1 object-fit-contain">
                  <span class="text-truncate">{{ jogador.timeNome }}</span>
                </div>
                <div class="d-flex gap-2 mt-2">
                   <span class="badge bg-secondary border border-secondary text-light">{{ jogador.posicao }}</span>
                   <span class="badge bg-dark border border-secondary text-muted">{{ jogador.nacionalidade }}</span>
                </div>
              </div>
              
              <div class="text-end text-primary fs-4">
                ➝
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BModal v-model="modalAberto" size="lg" hide-footer header-bg-variant="dark" header-text-variant="white" body-bg-variant="dark" body-text-variant="white">
      <template #title>
        <div class="d-flex align-items-center gap-2">
           <span class="badge fs-5" :class="getCorOverall(jogadorSelecionado?.overall)">{{ jogadorSelecionado?.overall || '-' }}</span>
           <span class="fw-bold">{{ jogadorSelecionado?.nome }}</span>
        </div>
      </template>

      <div v-if="statsCarregando" class="text-center py-5">
        <BSpinner small variant="primary" /> Calculando estatísticas da carreira...
      </div>

      <div v-else-if="jogadorSelecionado">
        
        <div class="d-flex justify-content-between align-items-start mb-4 p-3 rounded bg-secondary bg-opacity-10 border border-secondary">
            <div>
                <div class="text-muted small mb-1">Clube Atual</div>
                <div class="d-flex align-items-center fs-5 fw-bold">
                    <img :src="jogadorSelecionado.timeEscudo" width="30" class="me-2"> {{ jogadorSelecionado.timeNome }}
                </div>
                <div class="mt-2">
                    <span class="badge bg-primary me-1">Camisa {{ jogadorSelecionado.numero }}</span>
                    <span class="badge bg-info text-dark">{{ jogadorSelecionado.posicao }}</span>
                </div>
            </div>
            <div class="text-end">
                <div class="text-muted small">Nacionalidade</div>
                <div>{{ jogadorSelecionado.nacionalidade }} 🏳️</div>
            </div>
        </div>

        <div class="row text-center mb-4">
            <div class="col-4">
                <div class="p-3 bg-dark border border-secondary rounded">
                    <div class="display-6 fw-bold text-white">{{ estatisticas.jogos }}</div>
                    <div class="text-muted small text-uppercase">Jogos</div>
                </div>
            </div>
            <div class="col-4">
                <div class="p-3 bg-dark border border-secondary rounded">
                    <div class="display-6 fw-bold text-success">{{ estatisticas.gols }}</div>
                    <div class="text-muted small text-uppercase">Gols</div>
                </div>
            </div>
            <div class="col-4">
                <div class="p-3 bg-dark border border-secondary rounded">
                    <div class="display-6 fw-bold text-warning">{{ estatisticas.motm }}</div>
                    <div class="text-muted small text-uppercase">Melhor do Jogo</div>
                </div>
            </div>
        </div>

        <h5 class="text-white border-bottom border-secondary pb-2 mb-3">Histórico de Partidas</h5>
        
        <div v-if="estatisticas.historicoJogos.length === 0" class="text-center text-muted py-3">
            Nenhuma partida registrada para este jogador.
        </div>

        <div class="list-group list-group-flush" style="max-height: 300px; overflow-y: auto;">
            <div v-for="jogo in estatisticas.historicoJogos" :key="jogo.id" class="list-group-item bg-transparent text-white border-secondary d-flex justify-content-between align-items-center px-0">
                
                <div class="d-flex align-items-center" style="width: 40%;">
                    <div class="small text-muted me-3" style="width: 80px;">{{ jogo.dataFormatada }}</div>
                    <div>
                        <div class="fw-bold small text-primary">{{ jogo.campeonatoNome }}</div>
                        <div class="small">{{ jogo.adversario }}</div>
                    </div>
                </div>

                <div class="text-center fw-bold fs-5" style="width: 20%;">
                    <span :class="{'text-success': jogo.vitoria, 'text-danger': jogo.derrota, 'text-muted': jogo.empate}">
                        {{ jogo.placar }}
                    </span>
                </div>

                <div class="text-end" style="width: 40%;">
                    <span v-if="jogo.golsNaPartida > 0" class="badge bg-success me-1">⚽ {{ jogo.golsNaPartida }}</span>
                    <span v-if="jogo.golsNaPartida >= 3" class="badge bg-warning text-dark">🔥 Hat-trick</span>
                    <span v-if="!jogo.golsNaPartida" class="text-muted small">-</span>
                </div>

            </div>
        </div>

      </div>
    </BModal>

  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BFormInput, BCard, BSpinner, BModal } from 'bootstrap-vue-next';

export default {
  name: 'BuscaJogadores',
  components: { BFormInput, BCard, BSpinner, BModal },
  data() {
    return {
      carregando: true,
      statsCarregando: false,
      termoBusca: '',
      todosJogadores: [], // Lista plana { ...jogador, timeId, timeNome, timeEscudo }
      modalAberto: false,
      jogadorSelecionado: null,
      estatisticas: {
          jogos: 0,
          gols: 0,
          motm: 0,
          historicoJogos: []
      }
    };
  },
  computed: {
    totalJogadores() {
        return this.todosJogadores.length;
    },
    jogadoresFiltrados() {
      if (!this.termoBusca || this.termoBusca.length < 2) return [];
      const termo = this.termoBusca.toLowerCase();
      // Retorna no máximo 20 resultados para não travar a tela
      return this.todosJogadores.filter(j => j.nome.toLowerCase().includes(termo)).slice(0, 20);
    }
  },
  async mounted() {
    await this.indexarJogadores();
  },
  methods: {
    async indexarJogadores() {
      this.carregando = true;
      try {
        const times = await DbService.getTimes();
        const listaPlana = [];

        times.forEach(time => {
            if(time.jogadores && Array.isArray(time.jogadores)) {
                time.jogadores.forEach(jog => {
                    listaPlana.push({
                        ...jog,
                        uid: jog.id || Math.random().toString(36), // Garante ID unico p/ lista
                        timeId: time.id,
                        timeNome: time.nome,
                        timeEscudo: time.escudo
                    });
                });
            }
        });
        
        // Ordena por overall (melhores primeiro)
        this.todosJogadores = listaPlana.sort((a,b) => (b.overall || 0) - (a.overall || 0));

      } catch (error) {
        console.error("Erro ao indexar jogadores:", error);
      } finally {
        this.carregando = false;
      }
    },

    getCorOverall(ovr) {
        const n = parseInt(ovr) || 0;
        if (n >= 90) return 'bg-info border-light'; // Craque
        if (n >= 80) return 'bg-success'; // Bom
        if (n >= 70) return 'bg-warning text-dark'; // Médio
        return 'bg-secondary'; // Comum
    },

    async abrirDetalhes(jogador) {
        this.jogadorSelecionado = jogador;
        this.modalAberto = true;
        this.statsCarregando = true;
        
        // Reset stats
        this.estatisticas = { jogos: 0, gols: 0, motm: 0, historicoJogos: [] };

        try {
            const campeonatos = await DbService.getCampeonatos();
            
            campeonatos.forEach(camp => {
                if(!camp.jogos) return;

                camp.jogos.forEach(jogo => {
                    if(!jogo.finalizado) return;

                    // Verifica se o time do jogador participou
                    const ehTimeA = String(jogo.timeA.id) === String(jogador.timeId);
                    const ehTimeB = String(jogo.timeB.id) === String(jogador.timeId);

                    if (!ehTimeA && !ehTimeB) return;

                    // Verifica Performance (Gols)
                    // Como não temos a súmula completa de "quem jogou", assumimos:
                    // 1. Se fez gol, jogou.
                    // 2. Se não fez gol, mas o time jogou, contamos como jogo (Aproximação até termos súmula)
                    // Idealmente: verificaríamos se ele está na lista de relacionados do jogo, mas isso não existe no objeto Jogo atual.
                    
                    let golsNaPartida = 0;
                    if(jogo.eventos) {
                        golsNaPartida = jogo.eventos.filter(e => e.tipo === 'GOL' && String(e.jogadorId) === String(jogador.id)).length;
                    }

                    // Incrementa Jogos (Assume titularidade se o time jogou, por enquanto)
                    this.estatisticas.jogos++;
                    this.estatisticas.gols += golsNaPartida;

                    // Lógica MOTM (Improvisada: Hat-trick = MOTM)
                    if(golsNaPartida >= 3) this.estatisticas.motm++;

                    // Histórico
                    const meuTime = ehTimeA ? jogo.timeA : jogo.timeB;
                    const adversario = ehTimeA ? jogo.timeB : jogo.timeA;
                    const golsMeuTime = ehTimeA ? jogo.golsA : jogo.golsB;
                    const golsAdv = ehTimeA ? jogo.golsB : jogo.golsA;

                    this.estatisticas.historicoJogos.push({
                        id: jogo.id,
                        campeonatoNome: camp.nome,
                        adversario: adversario.nome,
                        placar: `${golsMeuTime} x ${golsAdv}`,
                        vitoria: golsMeuTime > golsAdv,
                        derrota: golsMeuTime < golsAdv,
                        empate: golsMeuTime == golsAdv,
                        golsNaPartida: golsNaPartida,
                        dataFormatada: 'Rodada ' + jogo.rodada
                    });
                });
            });

            // Ordena histórico (mais recentes primeiro, aproximado pela ordem de inserção inversa)
            this.estatisticas.historicoJogos.reverse();

        } catch (e) {
            console.error(e);
        } finally {
            this.statsCarregando = false;
        }
    }
  }
};
</script>

<style scoped>
.avatar-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.2);
}
.hover-card {
    transition: transform 0.2s, border-color 0.2s;
}
.hover-card:hover {
    transform: translateY(-3px);
    border-color: var(--bs-primary) !important;
}
</style>