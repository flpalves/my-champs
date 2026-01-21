<template>
  <div class="container mt-4 mb-5">
    
    <div class="d-flex justify-content-between align-items-center mb-4 fade-in">
      <div>
        <h1 class="text-primary fw-bold mb-0">
          <span class="text-white">MY</span> Champs
        </h1>
        <p class="text-muted small mb-0">Painel de Controle de jogos de Futebol,<br> ou qualquer coisa parecida xD</p>
      </div>
      
      <div class="text-end">
        <div class="d-none d-md-block mb-2">
            <span class="d-block text-white fw-bold">{{ saudacao }}, Treinador.</span>
            <span class="text-muted small">{{ hoje }}</span>
        </div>
        <BButton variant="outline-light" size="sm" class="d-flex align-items-center gap-2 ms-auto" @click="abrirModalMundos">
            <span>🌍 {{ nomeMundoAtual }}</span>
            <span class="badge bg-secondary text-dark" style="font-size: 0.6rem;">Trocar</span>
        </BButton>
      </div>
    </div>

    <div v-if="!persistenciaGarantida" class="alert alert-warning small d-flex align-items-center mb-4 shadow-sm border-warning">
        <span class="me-2 fs-5">⚠️</span>
        <div>
            <strong>Atenção:</strong> O navegador pode limpar seus dados se faltar espaço.
            <a href="#" @click.prevent="tentarPersistenciaManual" class="text-dark fw-bold text-decoration-underline ms-1">
                Clique aqui para proteger seus dados permanentemente.
            </a>
        </div>
    </div>

    <BRow class="mb-4 fade-in-up">
      <BCol md="3" sm="6" class="mb-3">
        <div class="stat-card p-3 border-start border-4 border-primary bg-dark rounded shadow-sm h-100">
          <h3 class="fw-bold text-white mb-0">{{ stats.totalTimes }}</h3>
          <small class="text-muted text-uppercase">Clubes Licenciados</small>
        </div>
      </BCol>
      <BCol md="3" sm="6" class="mb-3">
        <div class="stat-card p-3 border-start border-4 border-success bg-dark rounded shadow-sm h-100">
          <h3 class="fw-bold text-white mb-0">{{ stats.totalCampeonatos }}</h3>
          <small class="text-muted text-uppercase">Torneios Criados</small>
        </div>
      </BCol>
      <BCol md="3" sm="6" class="mb-3">
        <div class="stat-card p-3 border-start border-4 border-warning bg-dark rounded shadow-sm h-100">
          <h3 class="fw-bold text-white mb-0">{{ stats.totalJogos }}</h3>
          <small class="text-muted text-uppercase">Partidas Realizadas</small>
        </div>
      </BCol>
      <BCol md="3" sm="6" class="mb-3">
        <div class="stat-card p-3 border-start border-4 border-info bg-dark rounded shadow-sm h-100">
          <h3 class="fw-bold text-white mb-0">{{ stats.totalGols }}</h3>
          <small class="text-muted text-uppercase">Gols Marcados</small>
        </div>
      </BCol>
    </BRow>

    <BRow>
      <BCol lg="8" class="mb-4 fade-in-up" style="animation-delay: 0.1s">
        <BCard title="🏆 Torneios Ativos" class="h-100 border-0 shadow-sm" style="min-height: 300px;">
          
          <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" small />
          </div>

          <div v-else-if="campeonatosAtivos.length === 0" class="text-center py-5 text-muted">
            <div class="mb-3" style="font-size: 3rem;">⚽</div>
            <h5>Nenhum campeonato em andamento.</h5>
            <p class="small">Comece uma nova temporada agora mesmo!</p>
            <BButton variant="primary" class="mt-2" @click="$router.push('/novo-campeonato')">
              Criar Campeonato
            </BButton>
          </div>

          <div v-else class="list-group list-group-flush">
            <div 
              v-for="camp in campeonatosAtivos" 
              :key="camp.id" 
              class="list-group-item bg-transparent text-white border-secondary action-row d-flex justify-content-between align-items-center p-3"
              @click="$router.push(`/campeonato/${camp.id}`)"
              style="cursor: pointer"
            >
              <div class="d-flex align-items-center">
                <div class="me-3 text-center" style="width: 40px;">
                  <span v-if="camp.tipo === 'MATA_MATA'" style="font-size: 1.5rem;">⚔️</span>
                  <span v-else-if="camp.tipo === 'GRUPOS'" style="font-size: 1.5rem;">🌍</span>
                  <span v-else style="font-size: 1.5rem;">📊</span>
                </div>
                <div>
                  <h6 class="mb-0 fw-bold text-primary">{{ camp.nome }}</h6>
                  <small class="text-muted">{{ formatarTipo(camp.tipo) }} • {{ contarTimes(camp) }} Times</small>
                </div>
              </div>
              <div class="text-end">
                <BBadge :variant="camp.status === 'FINALIZADO' ? 'secondary' : 'success'" class="mb-1">
                  {{ camp.status === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Finalizado' }}
                </BBadge>
                <div class="small text-muted">Criado em: {{ formatarData(camp.dataCriacao) }}</div>
              </div>
            </div>
          </div>
        </BCard>
      </BCol>

      <BCol lg="4" class="mb-4 fade-in-up" style="animation-delay: 0.2s">
        <BCard title="⚡ Acesso Rápido" class="h-100 border-0 shadow-sm">
          <div class="d-grid gap-3">
            
            <BButton variant="outline-primary" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/novo-campeonato')">
              <span class="fs-4 me-3">➕</span>
              <div>
                <div class="fw-bold">Novo Campeonato</div>
                <div class="small text-muted">Inicie uma nova copa ou liga</div>
              </div>
            </BButton>

            <BButton variant="outline-secondary" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/novo-time')">
              <span class="fs-4 me-3">🛡️</span>
              <div>
                <div class="fw-bold text-white">Cadastrar Clube</div>
                <div class="small text-muted">Adicione novos times ao banco</div>
              </div>
            </BButton>

            <BButton variant="outline-secondary" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/lista-clubes')">
              <span class="fs-4 me-3">📋</span>
              <div>
                <div class="fw-bold text-white">Gerenciar Clubes</div>
                <div class="small text-muted">Edite elencos e estádios</div>
              </div>
            </BButton>

            <BButton variant="outline-secondary" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/lista-campeonatos')">
              <span class="fs-4 me-3">📂</span>
              <div>
                <div class="fw-bold text-white">Histórico</div>
                <div class="small text-muted">Ver todos os campeonatos</div>
              </div>
            </BButton>

            <BButton variant="outline-warning" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/hall-da-fama')">
              <span class="fs-4 me-3">👑</span>
              <div>
                <div class="fw-bold text-white">Hall da Fama</div>
                <div class="small text-muted">Ranking histórico de clubes</div>
              </div>
            </BButton>

            <div class="border-top border-secondary my-1"></div>

            <BButton variant="outline-info" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/busca-jogadores')">
              <span class="fs-4 me-3">🔎</span>
              <div>
                <div class="fw-bold text-white">Scout de Jogadores</div>
                <div class="small text-muted">Buscar estatísticas e histórico</div>
              </div>
            </BButton>

            <BButton v-if="temNacionalidade" variant="outline-success" class="text-start p-3 d-flex align-items-center quick-btn" @click="$router.push('/busca-nacionalidade')">
              <span class="fs-4 me-3">🌍</span>
              <div>
                <div class="fw-bold text-white">Por Nacionalidade</div>
                <div class="small text-muted">Filtrar jogadores por país</div>
              </div>
            </BButton>

          </div>
        </BCard>
      </BCol>
    </BRow>

    <BModal v-model="modalMundosAberto" title="🌍 Gerenciar Mundos (Saves)" hide-footer size="lg" 
            header-bg-variant="dark" header-text-variant="white" body-bg-variant="dark" body-text-variant="white">
        <div class="p-2">
            <p class="text-muted small">
                Crie universos paralelos para seus campeonatos. Ex: Um mundo para "Futebol Retro", outro para "FIFA", etc.
            </p>

            <div class="d-flex gap-2 mb-4">
                <BFormInput v-model="novoSlotNome" placeholder="Nome do novo mundo..." class="bg-secondary text-white border-secondary" @keyup.enter="criarNovoMundo" />
                <BButton variant="success" @click="criarNovoMundo">Criar</BButton>
            </div>

            <div class="list-group">
                <div v-for="slot in slots" :key="slot.id" class="list-group-item bg-dark border-secondary text-white d-flex justify-content-between align-items-center">
                    <div>
                        <span v-if="slot.id === activeSlotId" class="text-success fw-bold me-2">●</span>
                        <span class="fw-bold">{{ slot.alias }}</span>
                        <div class="small text-muted">Criado em: {{ formatarData(slot.criadoEm) }}</div>
                    </div>
                    <div class="d-flex gap-2">
                        <BButton v-if="slot.id !== activeSlotId" size="sm" variant="outline-primary" @click="trocarMundo(slot.id)">
                            Carregar
                        </BButton>
                        <BButton v-if="slot.id === activeSlotId" size="sm" variant="success" disabled>
                            Ativo
                        </BButton>
                        <BButton v-if="slot.id !== activeSlotId" size="sm" variant="outline-danger" @click="excluirMundo(slot.id)">
                            🗑️
                        </BButton>
                    </div>
                </div>
            </div>
        </div>
    </BModal>

  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { 
  BRow, BCol, BCard, BButton, BBadge, BSpinner, BModal, BFormInput 
} from 'bootstrap-vue-next';

export default {
  name: 'Home',
  components: {
    BRow, BCol, BCard, BButton, BBadge, BSpinner, BModal, BFormInput
  },
  data() {
    return {
      carregando: true,
      stats: {
        totalTimes: 0,
        totalCampeonatos: 0,
        totalJogos: 0,
        totalGols: 0
      },
      temNacionalidade: false,
      persistenciaGarantida: true,
      campeonatosAtivos: [],
      
      // DADOS DE MUNDOS (SLOTS)
      modalMundosAberto: false,
      slots: [],
      activeSlotId: 0,
      novoSlotNome: '',

      saudacao: 'Bem-vindo',
      hoje: new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
  },
  computed: {
      nomeMundoAtual() {
          const slot = this.slots.find(s => s.id === this.activeSlotId);
          return slot ? slot.alias : 'Carregando...';
      }
  },
  async mounted() {
    this.definirSaudacao();
    
    // 1. Persistência
    this.persistenciaGarantida = await DbService.verificarStatusPersistencia();
    
    // 2. Carrega Dados
    await this.carregarSlots();
    await this.carregarDashboard();
  },
  methods: {
    definirSaudacao() {
      const hora = new Date().getHours();
      if (hora < 12) this.saudacao = 'Bom dia';
      else if (hora < 18) this.saudacao = 'Boa tarde';
      else this.saudacao = 'Boa noite';
    },

    async tentarPersistenciaManual() {
        const resultado = await DbService.solicitarPersistencia();
        this.persistenciaGarantida = resultado;
        
        if(resultado) {
            alert("Sucesso! O navegador confirmou que seus dados estão protegidos.");
        } else {
            alert("O navegador negou a persistência ou já a gerencia automaticamente.");
        }
    },

    // --- GERENCIAMENTO DE MUNDOS ---
    abrirModalMundos() {
        this.modalMundosAberto = true;
    },
    async carregarSlots() {
        this.slots = await DbService.getSlots();
        this.activeSlotId = await DbService.getActiveSlotId();
    },
    async criarNovoMundo() {
        if (!this.novoSlotNome.trim()) return alert("Digite um nome para o mundo.");
        await DbService.criarSlot(this.novoSlotNome);
        this.novoSlotNome = '';
        await this.carregarSlots();
        alert("Novo mundo criado com sucesso!");
    },
    async trocarMundo(id) {
        if (confirm("Deseja carregar este mundo? A página será recarregada.")) {
            await DbService.trocarSlot(id);
        }
    },
    async excluirMundo(id) {
        if (confirm("Tem certeza? Todos os times e campeonatos deste mundo serão apagados permanentemente.")) {
            try {
                await DbService.excluirSlot(id);
                await this.carregarSlots();
            } catch (e) {
                alert(e.message);
            }
        }
    },

    // --- DASHBOARD ---
    async carregarDashboard() {
      try {
        const [times, campeonatos] = await Promise.all([
          DbService.getTimes(),
          DbService.getCampeonatos()
        ]);

        this.stats.totalTimes = times.length;
        this.stats.totalCampeonatos = campeonatos.length;
        
        this.temNacionalidade = times.some(t => 
            t.jogadores && t.jogadores.some(j => j.nacionalidade)
        );

        let totalJogosRealizados = 0;
        let totalGolsMarcados = 0;

        campeonatos.forEach(c => {
            if(c.jogos && Array.isArray(c.jogos)) {
                const realizados = c.jogos.filter(j => j.finalizado);
                totalJogosRealizados += realizados.length;
                
                realizados.forEach(j => {
                    const golsA = parseInt(j.golsA) || 0;
                    const golsB = parseInt(j.golsB) || 0;
                    totalGolsMarcados += (golsA + golsB);
                });
            }
        });

        this.stats.totalJogos = totalJogosRealizados;
        this.stats.totalGols = totalGolsMarcados;

        this.campeonatosAtivos = campeonatos
          .filter(c => c.status === 'EM_ANDAMENTO')
          .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
          .slice(0, 5);

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        this.carregando = false;
      }
    },

    formatarTipo(tipo) {
      const mapa = {
        'PONTOS_CORRIDOS': 'Pontos Corridos',
        'MATA_MATA': 'Mata-Mata',
        'GRUPOS': 'Fase de Grupos',
        'LIGA_COM_FINAL': 'Liga + Final'
      };
      return mapa[tipo] || tipo;
    },

    formatarData(dataIso) {
      if (!dataIso) return '-';
      return new Date(dataIso).toLocaleDateString('pt-BR');
    },

    contarTimes(camp) {
      return camp.timesParticipantes ? camp.timesParticipantes.length : 0;
    }
  }
}
</script>

<style scoped>
.fade-in {
  animation: fadeIn 0.8s ease-out;
}
.fade-in-up {
  animation: fadeInUp 0.8s ease-out backwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-card {
  transition: transform 0.2s;
  background-color: #212529; 
}
.stat-card:hover {
  transform: translateY(-5px);
}

.action-row {
  transition: background-color 0.2s, transform 0.1s;
  border-left: 3px solid transparent;
}
.action-row:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-left: 3px solid var(--bs-primary);
}

.quick-btn {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(255, 255, 255, 0.02);
  transition: all 0.2s;
}
.quick-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}
</style>