<template>
  <div class="container mt-4 mb-5">

    <div v-if="carregando" class="text-center py-5">
      <BSpinner variant="primary" label="Processando dados..." />
    </div>

    <div v-else-if="!campeonato">
      <BAlert show variant="danger">Campeonato não encontrado.</BAlert>
      <BButton @click="$router.push('/lista-campeonatos')">Voltar</BButton>
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="text-primary fw-bold mb-0">
            {{ campeonato.tipo === 'MATA_MATA' ? 'Chaveamento' : 'Classificação' }}
          </h2>
          <span class="text-muted">{{ campeonato.nome }} <BBadge>{{ formatarTipo(campeonato.tipo) }}</BBadge></span>
        </div>
        <BButton variant="outline-secondary" @click="$router.push(`/campeonato/${id}`)">
          Ver Jogos
        </BButton>
      </div>

      <div v-if="campeonato.tipo === 'PONTOS_CORRIDOS'">
        <BCard class="shadow-sm p-0 overflow-hidden">
          <BTableSimple hover responsive striped class="mb-0 align-middle">
            <BThead variant="dark">
              <BTr>
                <BTh>#</BTh>
                <BTh>Time</BTh>
                <BTh v-for="col in colunas" :key="col.chave" class="text-center cursor-pointer user-select-none"
                  @click="alterarOrdenacao(col.chave)" :title="col.titulo"
                  :class="{ 'bg-secondary': ordenacao.coluna === col.chave }">
                  {{ col.sigla }}
                  <span v-if="ordenacao.coluna === col.chave" class="small">
                    {{ ordenacao.direcao === 'desc' ? '▼' : '▲' }}
                  </span>
                </BTh>
              </BTr>
            </BThead>
            <BTbody>
              <BTr v-for="(time, index) in timesClassificados" :key="time.id">
                <BTd class="text-center text-muted small" style="width: 50px;">{{ index + 1 }}º</BTd>
                <BTd style="min-width: 200px;">
                  <div class="d-flex align-items-center">
                    <img :src="time.escudo" class="me-2" style="width: 30px; height: 30px; object-fit: contain;"
                      onerror="this.style.display='none'" />
                    <span class="fw-bold">{{ time.nome }}</span>
                  </div>
                </BTd>
                <BTd class="text-center fw-bold text-primary">{{ time.pontos }}</BTd>
                <BTd class="text-center">{{ time.jogos }}</BTd>
                <BTd class="text-center">{{ time.vitorias }}</BTd>
                <BTd class="text-center">{{ time.empates }}</BTd>
                <BTd class="text-center">{{ time.derrotas }}</BTd>
                <BTd class="text-center small">{{ time.aproveitamento }}%</BTd>
                <BTd class="text-center">{{ time.saldoGols }}</BTd>
                <BTd class="text-center text-muted small">{{ time.golsPro }}</BTd>
                <BTd class="text-center text-muted small">{{ time.golsContra }}</BTd>
              </BTr>
            </BTbody>
          </BTableSimple>
        </BCard>
        <div class="mt-2 text-muted small">
          <span class="me-3"><strong>P:</strong> Pontos</span>
          <span class="me-3"><strong>J:</strong> Jogos</span>
          <span class="me-3"><strong>V:</strong> Vitórias</span>
          <span class="me-3"><strong>E:</strong> Empates</span>
          <span class="me-3"><strong>D:</strong> Derrotas</span>
          <span class="me-3"><strong>%:</strong> Aproveitamento</span>
          <span class="me-3"><strong>SG:</strong> Saldo de Gols</span>
          <span class="me-3"><strong>GP:</strong> Gols Pró</span>
          <span><strong>GC:</strong> Gols Contra</span>
        </div>
      </div>

      <div v-else-if="campeonato.tipo === 'LIGA_COM_FINAL'">
        
        <div v-if="classificacaoFaseFinal.length > 0" class="mb-5">
            <h4 class="text-warning fw-bold border-start border-4 border-warning ps-2 mb-3">
                🏆 Fase Final
                <span class="badge bg-dark fs-6 ms-2 text-white fw-normal" v-if="campeonato.zerarPontos">Pontos Zerados</span>
                <span class="badge bg-dark fs-6 ms-2 text-white fw-normal" v-else>Pontos Acumulados</span>
            </h4>
            
            <BCard class="shadow-sm p-0 overflow-hidden border-warning">
                <BTableSimple hover responsive striped class="mb-0 align-middle">
                    <BThead class="bg-warning text-dark">
                    <BTr>
                        <BTh>#</BTh>
                        <BTh>Time</BTh>
                        <BTh v-for="col in colunas" :key="col.chave" class="text-center">{{ col.sigla }}</BTh>
                    </BTr>
                    </BThead>
                    <BTbody>
                    <BTr v-for="(time, index) in classificacaoFaseFinal" :key="time.id">
                        <BTd class="text-center fw-bold" style="width: 50px;">{{ index + 1 }}º</BTd>
                        <BTd style="min-width: 200px;">
                        <div class="d-flex align-items-center">
                            <img :src="time.escudo" class="me-2" style="width: 30px; height: 30px; object-fit: contain;" onerror="this.style.display='none'" />
                            <span class="fw-bold">{{ time.nome }}</span>
                            <!-- <span v-if="index === 0 && time.jogos > 0" class="ms-2 badge bg-warning text-dark">Líder</span> -->
                        </div>
                        </BTd>
                        <BTd class="text-center fw-bold">{{ time.pontos }}</BTd>
                        <BTd class="text-center">{{ time.jogos }}</BTd>
                        <BTd class="text-center">{{ time.vitorias }}</BTd>
                        <BTd class="text-center">{{ time.empates }}</BTd>
                        <BTd class="text-center">{{ time.derrotas }}</BTd>
                        <BTd class="text-center small">{{ time.aproveitamento }}%</BTd>
                        <BTd class="text-center">{{ time.saldoGols }}</BTd>
                        <BTd class="text-center text-muted small">{{ time.golsPro }}</BTd>
                        <BTd class="text-center text-muted small">{{ time.golsContra }}</BTd>
                    </BTr>
                    </BTbody>
                </BTableSimple>
            </BCard>
        </div>

        <h4 class="text-primary fw-bold border-start border-4 border-primary ps-2 mb-3">
            1ª Fase (Classificação Geral)
        </h4>
        <BCard class="shadow-sm p-0 overflow-hidden">
          <BTableSimple hover responsive striped class="mb-0 align-middle">
            <BThead variant="dark">
              <BTr>
                <BTh>#</BTh>
                <BTh>Time</BTh>
                <BTh v-for="col in colunas" :key="col.chave" class="text-center cursor-pointer user-select-none"
                  @click="alterarOrdenacao(col.chave)" :title="col.titulo"
                  :class="{ 'bg-secondary': ordenacao.coluna === col.chave }">
                  {{ col.sigla }}
                  <span v-if="ordenacao.coluna === col.chave" class="small">
                    {{ ordenacao.direcao === 'desc' ? '▼' : '▲' }}
                  </span>
                </BTh>
              </BTr>
            </BThead>
            <BTbody>
              <BTr v-for="(time, index) in timesClassificados" :key="time.id" 
                   :class="{'qualy-success': index < (campeonato.qtdClassificados || 4)}">
                <BTd class="text-center text-muted small" style="width: 50px;">{{ index + 1 }}º</BTd>
                <BTd style="min-width: 200px;">
                  <div class="d-flex align-items-center">
                    <img :src="time.escudo" class="me-2" style="width: 30px; height: 30px; object-fit: contain;"
                      onerror="this.style.display='none'" />
                    <span class="fw-bold">{{ time.nome }}</span>
                    <!-- <span v-if="index < (campeonato.qtdClassificados || 4)" class="badge bg-success ms-2 small">Classifica</span> -->
                  </div>
                </BTd>
                <BTd class="text-center fw-bold text-primary">{{ time.pontos }}</BTd>
                <BTd class="text-center">{{ time.jogos }}</BTd>
                <BTd class="text-center">{{ time.vitorias }}</BTd>
                <BTd class="text-center">{{ time.empates }}</BTd>
                <BTd class="text-center">{{ time.derrotas }}</BTd>
                <BTd class="text-center small">{{ time.aproveitamento }}%</BTd>
                <BTd class="text-center">{{ time.saldoGols }}</BTd>
                <BTd class="text-center text-muted small">{{ time.golsPro }}</BTd>
                <BTd class="text-center text-muted small">{{ time.golsContra }}</BTd>
              </BTr>
            </BTbody>
          </BTableSimple>
        </BCard>
      </div>

      <div v-else-if="campeonato.tipo === 'GRUPOS'">
        <div v-for="(grupoTimes, nomeGrupo) in classificacaoPorGrupo" :key="nomeGrupo" class="mb-4">
          <h5 class="fw-bold border-start border-4 border-primary ps-2 mb-2 py-2">
            {{ nomeGrupo }}
          </h5>
          <BCard class="shadow-sm p-0 overflow-hidden">
            <BTableSimple hover responsive striped class="mb-0 align-middle">
              <BThead variant="dark">
                <BTr>
                  <BTh>#</BTh>
                  <BTh>Time</BTh>
                  <BTh v-for="col in colunas" :key="col.chave" class="text-center cursor-pointer user-select-none"
                    @click="alterarOrdenacao(col.chave)" :title="col.titulo"
                    :class="{ 'bg-secondary': ordenacao.coluna === col.chave }">
                    {{ col.sigla }}
                    <span v-if="ordenacao.coluna === col.chave" class="small">
                      {{ ordenacao.direcao === 'desc' ? '▼' : '▲' }}
                    </span>
                  </BTh>
                </BTr>
              </BThead>
              <BTbody>
                <BTr v-for="(time, index) in grupoTimes" :key="time.id">
                  <BTd class="text-center text-muted small" style="width: 50px;">{{ index + 1 }}º</BTd>
                  <BTd style="min-width: 200px;">
                    <div class="d-flex align-items-center">
                      <img :src="time.escudo" class="me-2" style="width: 30px; height: 30px; object-fit: contain;"
                        onerror="this.style.display='none'" />
                      <span class="fw-bold">{{ time.nome }}</span>
                    </div>
                  </BTd>
                  <BTd class="text-center fw-bold text-primary">{{ time.pontos }}</BTd>
                  <BTd class="text-center">{{ time.jogos }}</BTd>
                  <BTd class="text-center">{{ time.vitorias }}</BTd>
                  <BTd class="text-center">{{ time.empates }}</BTd>
                  <BTd class="text-center">{{ time.derrotas }}</BTd>
                  <BTd class="text-center small">{{ time.aproveitamento }}%</BTd>
                  <BTd class="text-center">{{ time.saldoGols }}</BTd>
                  <BTd class="text-center text-muted small">{{ time.golsPro }}</BTd>
                  <BTd class="text-center text-muted small">{{ time.golsContra }}</BTd>
                </BTr>
              </BTbody>
            </BTableSimple>
          </BCard>
        </div>

        <div v-if="temMataMata" class="mt-5 pt-4 border-top">
          <h4 class="text-primary fw-bold mb-4">Fase Final</h4>
          <div class="d-flex flex-nowrap overflow-auto pb-4 gap-4" style="min-height: 400px;">
            <div v-for="(fase, nomeFase) in dadosMataMata" :key="nomeFase" class="fase-coluna"
              style="min-width: 320px;">
              <h5 class="text-center bg-dark text-white py-2 rounded-top mb-0">{{ nomeFase }}</h5>
              <div class="p-3 h-100 border-start border-end border-bottom">
                <div v-for="confronto in fase" :key="confronto.id" class="card mb-3 shadow-sm border-0 confronto-card">
                  <div class="card-body p-2">
                    <div class="d-flex justify-content-between text-muted small mb-1">
                      <span>Confronto #{{ confronto.id }}</span>
                      <span v-if="confronto.finalizado" class="text-success fw-bold">Finalizado</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center p-2 rounded mb-1"
                      :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeA.id, ' ': confronto.vencedor !== confronto.timeA.id }">
                      <div class="d-flex align-items-center">
                        <img :src="confronto.timeA.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                        <span>{{ confronto.timeA.nome }}</span>
                      </div>
                      <div class="d-flex gap-2">
                        <span class="badge bg-secondary">{{ confronto.placarA_Ida }}</span>
                        <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarA_Volta }}</span>
                        <span class="fw-bold ms-1">{{ confronto.totalA }}</span>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center p-2 rounded"
                      :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeB.id, ' ': confronto.vencedor !== confronto.timeB.id }">
                      <div class="d-flex align-items-center">
                        <img :src="confronto.timeB.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                        <span>{{ confronto.timeB.nome }}</span>
                      </div>
                      <div class="d-flex gap-2">
                        <span class="badge bg-secondary">{{ confronto.placarB_Ida }}</span>
                        <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarB_Volta }}</span>
                        <span class="fw-bold ms-1">{{ confronto.totalB }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="campeonato.tipo === 'MATA_MATA'">
        <div class="d-flex flex-nowrap overflow-auto pb-4 gap-4" style="min-height: 400px;">
          <div v-for="(fase, nomeFase) in dadosMataMata" :key="nomeFase" class="fase-coluna" style="min-width: 320px;">
            <h5 class="text-center bg-dark text-white py-2 rounded-top mb-0">{{ nomeFase }}</h5>
            <div class="p-3 h-100 border-start border-end border-bottom">
              <div v-for="confronto in fase" :key="confronto.id" class="card mb-3 shadow-sm border-0 confronto-card">
                <div class="card-body p-2">
                  <div class="d-flex justify-content-between text-muted small mb-1">
                    <span>Confronto #{{ confronto.id }}</span>
                    <span v-if="confronto.finalizado" class="text-success fw-bold">Finalizado</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center p-2 rounded mb-1"
                    :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeA.id, ' ': confronto.vencedor !== confronto.timeA.id }">
                    <div class="d-flex align-items-center">
                      <img :src="confronto.timeA.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                      <span>{{ confronto.timeA.nome }}</span>
                    </div>
                    <div class="d-flex gap-2">
                      <span class="badge bg-secondary">{{ confronto.placarA_Ida }}</span>
                      <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarA_Volta }}</span>
                      <span class="fw-bold ms-1">{{ confronto.totalA }}</span>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center p-2 rounded"
                    :class="{ 'bg-success-subtle fw-bold': confronto.vencedor === confronto.timeB.id, ' ': confronto.vencedor !== confronto.timeB.id }">
                    <div class="d-flex align-items-center">
                      <img :src="confronto.timeB.escudo" width="24" class="me-2" onerror="this.style.display='none'">
                      <span>{{ confronto.timeB.nome }}</span>
                    </div>
                    <div class="d-flex gap-2">
                      <span class="badge bg-secondary">{{ confronto.placarB_Ida }}</span>
                      <span v-if="confronto.temVolta" class="badge bg-secondary">{{ confronto.placarB_Volta }}</span>
                      <span class="fw-bold ms-1">{{ confronto.totalB }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="Object.keys(dadosMataMata).length === 0" class="text-center w-100 py-5 text-muted">
            Nenhum confronto definido ainda.
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import DbService from '../services/DbService.js';
import {
  BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BAlert, BBadge
} from 'bootstrap-vue-next';

export default {
  name: 'TabelaClassificacao',
  components: {
    BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BAlert, BBadge
  },
  props: {
    id: { type: [String, Number], required: true }
  },
  data() {
    return {
      carregando: true,
      campeonato: null,
      tabelaBase: [], // Todos os times com stats calculados da 1ª FASE (ou geral)

      ordenacao: { coluna: 'pontos', direcao: 'desc' },

      colunas: [
        { sigla: 'P', chave: 'pontos', titulo: 'Pontos' },
        { sigla: 'J', chave: 'jogos', titulo: 'Jogos' },
        { sigla: 'V', chave: 'vitorias', titulo: 'Vitórias' },
        { sigla: 'E', chave: 'empates', titulo: 'Empates' },
        { sigla: 'D', chave: 'derrotas', titulo: 'Derrotas' },
        { sigla: '%', chave: 'aproveitamentoNum', titulo: 'Aproveitamento' },
        { sigla: 'SG', chave: 'saldoGols', titulo: 'Saldo de Gols' },
        { sigla: 'GP', chave: 'golsPro', titulo: 'Gols Pró' },
        { sigla: 'GC', chave: 'golsContra', titulo: 'Gols Contra' },
      ]
    }
  },
  computed: {
    // --- Lógica para Pontos Corridos e Base para Grupos ---
    timesClassificados() {
      // Ordena a tabelaBase inteira (Classificação Geral / 1ª Fase)
      return this.ordenarTimes([...this.tabelaBase]);
    },

    // --- NOVA LÓGICA CORRIGIDA: FASE FINAL DA LIGA ---
    classificacaoFaseFinal() {
        if (!this.campeonato || this.campeonato.tipo !== 'LIGA_COM_FINAL') return [];
        
        // Verifica se existem jogos na fase final
        const jogosFinal = this.campeonato.jogos.filter(j => j.fase === 'Fase Final');
        if (jogosFinal.length === 0) return []; // Fase ainda não começou

        // Identifica os times que estão na fase final
        const idsFinalistas = new Set();
        jogosFinal.forEach(j => { idsFinalistas.add(j.timeA.id); idsFinalistas.add(j.timeB.id); });

        // Calcula stats
        const statsFinal = {};
        idsFinalistas.forEach(id => {
            const infoTime = this.campeonato.timesParticipantes.find(t => t.id === id);
            statsFinal[id] = {
                id: id,
                nome: infoTime ? infoTime.nome : 'Time',
                escudo: infoTime ? infoTime.escudo : null,
                pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
                golsPro: 0, golsContra: 0, saldoGols: 0, aproveitamento: '0.0', aproveitamentoNum: 0
            };
        });

        // Decide quais jogos contar:
        const zerar = this.campeonato.zerarPontos;
        
        const jogosParaCalcular = this.campeonato.jogos.filter(j => {
            if (!j.finalizado) return false;
            // Se deve zerar, ignora jogos que NÃO são da fase final
            if (zerar && j.fase !== 'Fase Final') return false;
            // Se não for jogo de fase final e nem da fase inicial (ex: undefined), ignora
            if (j.fase && j.fase !== 'Fase Final') return false; 
            return true;
        });

        jogosParaCalcular.forEach(jogo => {
            const tA = statsFinal[jogo.timeA.id];
            const tB = statsFinal[jogo.timeB.id];
            
            // CORREÇÃO AQUI: Verificamos individualmente se cada time é finalista.
            // Se "Acumular Pontos", o finalista soma pontos mesmo se jogou contra um eliminado na 1ª fase.
            
            // Time A é finalista?
            if (tA) {
                tA.jogos++; 
                tA.golsPro += (jogo.golsA || 0); 
                tA.golsContra += (jogo.golsB || 0);

                if (jogo.golsA > jogo.golsB) { tA.vitorias++; tA.pontos += 3; }
                else if (jogo.golsB > jogo.golsA) { tA.derrotas++; }
                else { tA.empates++; tA.pontos += 1; }
            }

            // Time B é finalista?
            if (tB) {
                tB.jogos++;
                tB.golsPro += (jogo.golsB || 0); 
                tB.golsContra += (jogo.golsA || 0);

                if (jogo.golsB > jogo.golsA) { tB.vitorias++; tB.pontos += 3; }
                else if (jogo.golsA > jogo.golsB) { tB.derrotas++; }
                else { tB.empates++; tB.pontos += 1; }
            }
        });

        // Formata e ordena
        const lista = Object.values(statsFinal).map(t => {
            t.saldoGols = t.golsPro - t.golsContra;
            if (t.jogos > 0) {
                const ap = (t.pontos / (t.jogos * 3)) * 100;
                t.aproveitamentoNum = ap;
                t.aproveitamento = ap.toFixed(1);
            } else {
                t.aproveitamentoNum = 0; t.aproveitamento = '0.0';
            }
            return t;
        });

        return this.ordenarTimes(lista);
    },

    // --- Lógica para Grupos ---
    classificacaoPorGrupo() {
      if (!this.campeonato || this.campeonato.tipo !== 'GRUPOS') return {};

      const gruposObj = {};

      if (this.campeonato.grupos) {
        this.campeonato.grupos.forEach(g => { gruposObj[g.nome] = [] });
      }

      this.tabelaBase.forEach(timeStats => {
        const grupoDoTime = this.campeonato.grupos.find(g => g.times.some(t => t.id === timeStats.id));
        if (grupoDoTime) {
          if (!gruposObj[grupoDoTime.nome]) gruposObj[grupoDoTime.nome] = [];
          gruposObj[grupoDoTime.nome].push(timeStats);
        }
      });

      for (const nome in gruposObj) {
        gruposObj[nome] = this.ordenarTimes(gruposObj[nome]);
      }

      return gruposObj;
    },

    // --- Lógica para Mata-Mata ---
    dadosMataMata() {
        if (!this.campeonato) return {};
        if (this.campeonato.tipo !== 'MATA_MATA' && !this.temMataMata) return {};
        
        const fases = {};
        const jogos = this.campeonato.jogos || [];
        
        jogos.forEach(jogo => {
            if (!jogo.fase) return; // Ignora jogos de pontos corridos

            const nomeFase = jogo.fase;
            if (!fases[nomeFase]) fases[nomeFase] = {}; 

            const confId = jogo.confrontoId;
            if (!fases[nomeFase][confId]) {
                fases[nomeFase][confId] = {
                    id: confId,
                    timeA: jogo.timeA,
                    timeB: jogo.timeB,
                    placarA_Ida: '-', placarB_Ida: '-',
                    placarA_Volta: '-', placarB_Volta: '-',
                    totalA: 0, totalB: 0,
                    temVolta: false,
                    finalizado: false,
                    vencedor: null
                };
            }
            
            const confronto = fases[nomeFase][confId];

            if (jogo.turno === 1) {
                confronto.placarA_Ida = jogo.golsA ?? '-';
                confronto.placarB_Ida = jogo.golsB ?? '-';
                if (jogo.finalizado) {
                    confronto.totalA += jogo.golsA;
                    confronto.totalB += jogo.golsB;
                }
            } else {
                confronto.temVolta = true;
                confronto.placarA_Volta = jogo.golsB ?? '-'; 
                confronto.placarB_Volta = jogo.golsA ?? '-'; 
                
                if (jogo.finalizado) {
                    confronto.totalA += jogo.golsB;
                    confronto.totalB += jogo.golsA;
                }
            }
            
            const idaFinalizada = jogos.find(j => j.confrontoId === confId && j.turno === 1)?.finalizado;
            const voltaFinalizada = jogos.find(j => j.confrontoId === confId && j.turno === 2)?.finalizado;
            
            confronto.finalizado = confronto.temVolta ? (idaFinalizada && voltaFinalizada) : idaFinalizada;

            if (confronto.finalizado) {
                if (confronto.totalA > confronto.totalB) confronto.vencedor = confronto.timeA.id;
                else if (confronto.totalB > confronto.totalA) confronto.vencedor = confronto.timeB.id;
                else confronto.vencedor = 'PENALTIS';
            }
        });

        const resultadoFinal = {};
        for (const f in fases) {
            resultadoFinal[f] = Object.values(fases[f]).sort((a,b) => a.id - b.id);
        }

        return resultadoFinal;
    },

    temMataMata() {
      if (!this.campeonato || !this.campeonato.jogos) return false;
      return this.campeonato.jogos.some(j => j.fase);
    },
  },
  async mounted() {
    await this.carregarEClassificar();
  },
  methods: {
    formatarTipo(tipo) {
      if (tipo === 'PONTOS_CORRIDOS') return 'Pontos Corridos';
      if (tipo === 'MATA_MATA') return 'Mata-Mata';
      if (tipo === 'GRUPOS') return 'Fase de Grupos';
      if (tipo === 'LIGA_COM_FINAL') return 'Liga + Final';
      return tipo;
    },

    async carregarEClassificar() {
      this.carregando = true;
      try {
        const camp = await DbService.getCampeonatoById(this.id);
        if (camp) {
          this.campeonato = camp;
          this.calcularStatsBase(camp);
        }
      } catch (error) {
        console.error("Erro ao calcular classificação:", error);
      } finally {
        this.carregando = false;
      }
    },

    // Calcula stats da 1ª FASE (Jogos sem a propriedade 'fase')
    calcularStatsBase(camp) {
      const mapaStats = {};
      
      camp.timesParticipantes.forEach(time => {
        mapaStats[time.id] = {
          id: time.id,
          nome: time.nome,
          escudo: time.escudo,
          pontos: 0, jogos: 0, vitorias: 0, empates: 0, derrotas: 0,
          golsPro: 0, golsContra: 0, saldoGols: 0, aproveitamento: '0.0', aproveitamentoNum: 0
        };
      });

      if (camp.jogos) {
          camp.jogos.forEach(jogo => {
            if (!jogo.finalizado) return;
            
            // SE TIVER FASE DEFINIDA (ex: Mata-mata ou Fase Final), ignoramos na tabela da 1ª fase
            if (jogo.fase) return; 

            const timeA = mapaStats[jogo.timeA.id];
            const timeB = mapaStats[jogo.timeB.id];
            
            if (!timeA || !timeB) return;

            timeA.jogos++; timeB.jogos++;
            timeA.golsPro += (jogo.golsA || 0); 
            timeA.golsContra += (jogo.golsB || 0);
            timeB.golsPro += (jogo.golsB || 0); 
            timeB.golsContra += (jogo.golsA || 0);

            if (jogo.golsA > jogo.golsB) {
              timeA.vitorias++; timeA.pontos += 3; timeB.derrotas++;
            } else if (jogo.golsB > jogo.golsA) {
              timeB.vitorias++; timeB.pontos += 3; timeA.derrotas++;
            } else {
              timeA.empates++; timeA.pontos += 1; timeB.empates++; timeB.pontos += 1;
            }
          });
      }

      this.tabelaBase = Object.values(mapaStats).map(t => {
        t.saldoGols = t.golsPro - t.golsContra;
        if (t.jogos > 0) {
          const aproveitamento = (t.pontos / (t.jogos * 3)) * 100;
          t.aproveitamentoNum = aproveitamento;
          t.aproveitamento = aproveitamento.toFixed(1);
        } else {
            t.aproveitamentoNum = 0;
            t.aproveitamento = '0.0';
        }
        return t;
      });
    },

    ordenarTimes(lista) {
      return lista.sort((a, b) => {
        const valA = a[this.ordenacao.coluna];
        const valB = b[this.ordenacao.coluna];
        if (valA !== valB) return this.ordenacao.direcao === 'desc' ? valB - valA : valA - valB;

        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
        if (b.saldoGols !== a.saldoGols) return b.saldoGols - a.saldoGols;
        return a.golsContra - b.golsContra;
      });
    },

    alterarOrdenacao(chave) {
      if (this.ordenacao.coluna === chave) {
        this.ordenacao.direcao = this.ordenacao.direcao === 'desc' ? 'asc' : 'desc';
      } else {
        this.ordenacao.coluna = chave;
        this.ordenacao.direcao = 'desc';
      }
    }
  }
}
</script>

<style scoped>
.cursor-pointer:hover {
  background-color: #444 !important;
  color: #fff;
}

.fase-coluna {
  min-width: 300px;
  max-width: 350px;
}

.d-flex.overflow-auto::-webkit-scrollbar {
  height: 8px;
}

.d-flex.overflow-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
.qualy-success{
  border-left: 4px solid #090;
}
</style>