<template>
    <div class="relatorio-container bg-white text-dark">
        
        <div class="d-print-none container py-3 mb-4 border-bottom d-flex justify-content-between align-items-center">
            <BButton variant="outline-secondary" @click="$router.go(-1)">← Voltar</BButton>
            <div>
                <span class="text-dark small me-3 fw-bold">Dica: Ative "Gráficos de plano de fundo" na impressão para ver os escudos.</span>
                <BButton variant="primary" @click="imprimir">🖨️ Imprimir / Salvar PDF</BButton>
            </div>
        </div>

        <div v-if="carregando" class="text-center py-5 d-print-none">
            <BSpinner variant="primary" />
        </div>

        <div v-else-if="campeonato" class="folha-a4 mx-auto p-5">
            
            <div class="text-center mb-5 pb-3">
                <h1 class="fw-bold text-uppercase mb-1 display-6">{{ campeonato.nome }}</h1>
                <p class="text-secondary fw-bold mb-0">RELATÓRIO OFICIAL</p>
                <div class="small mt-2 text-secondary">
                    ENCERRADO • Emitido em {{ new Date().toLocaleDateString() }}
                </div>
            </div>

            <div class="row mb-5 text-center stats-box mx-0 py-3 bg-light rounded-3">
                <div class="col-3">
                    <h3 class="fw-bold mb-0">{{ campeonato.timesParticipantes.length }}</h3>
                    <small class="text-uppercase text-secondary fw-bold" style="font-size: 0.7rem;">Times</small>
                </div>
                <div class="col-3">
                    <h3 class="fw-bold mb-0">{{ totalJogos }}</h3>
                    <small class="text-uppercase text-secondary fw-bold" style="font-size: 0.7rem;">Jogos</small>
                </div>
                <div class="col-3">
                    <h3 class="fw-bold mb-0">{{ totalGols }}</h3>
                    <small class="text-uppercase text-secondary fw-bold" style="font-size: 0.7rem;">Gols</small>
                </div>
                <div class="col-3">
                    <h3 class="fw-bold mb-0">{{ mediaGols }}</h3>
                    <small class="text-uppercase text-secondary fw-bold" style="font-size: 0.7rem;">Média</small>
                </div>
            </div>

            <div v-for="(grupo, key) in jogosAgrupados" :key="key" class="mb-5 keep-together">
                <h5 class="fw-bold text-uppercase text-secondary mb-3 pb-1" style="letter-spacing: 1px;">
                    {{ formatarTituloGrupo(key) }}
                </h5>
                
                <div v-for="jogo in grupo" :key="jogo.id" class="mb-4">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                        <div class="text-end" style="width: 40%;">
                            <span class="fw-bold fs-6">{{ jogo.timeA.nome }}</span>
                            <img :src="jogo.timeA.escudo" class="ms-3 escudo-print" />
                        </div>
                        
                        <div class="text-center px-3 py-1 bg-light rounded-pill fw-bold fs-5" style="width: 15%; min-width: 80px;">
                            {{ jogo.golsA }} <span class="mx-1 text-secondary">-</span> {{ jogo.golsB }}
                        </div>

                        <div class="text-start" style="width: 40%;">
                            <img :src="jogo.timeB.escudo" class="me-3 escudo-print" />
                            <span class="fw-bold fs-6">{{ jogo.timeB.nome }}</span>
                        </div>
                    </div>

                    <div class="text-center mb-1 text-secondary" style="font-size: 0.75rem;">
                        <span class="fw-bold">🏟️ {{ getEstadio(jogo.timeA.id) }}</span>
                        <span class="mx-2">•</span>
                        <span>📅 {{ formatarData(jogo.dataHora) }}</span>
                    </div>

                    <div v-if="temEventosRelevantes(jogo)" class="text-center mt-1" style="font-size: 0.75rem; line-height: 1.4;">
                        <div v-if="getEventosPorTipo(jogo, 'GOL').length > 0" class="text-dark">
                            <span class="fw-bold">⚽ Gols:</span> 
                            <span v-for="(ev, i) in getEventosPorTipo(jogo, 'GOL')" :key="ev.id" class="text-secondary">
                                {{ getNomeJogador(ev, jogo) }} ({{ getSiglaTime(ev.timeId, jogo) }})<span v-if="i < getEventosPorTipo(jogo, 'GOL').length - 1">, </span>
                            </span>
                        </div>
                        <div v-if="getEventosPorTipo(jogo, 'VERMELHO').length > 0" class="text-danger">
                            <span class="fw-bold">🟥 Expulsões:</span>
                            <span v-for="(ev, i) in getEventosPorTipo(jogo, 'VERMELHO')" :key="ev.id">
                                {{ getNomeJogador(ev, jogo) }}<span v-if="i < getEventosPorTipo(jogo, 'VERMELHO').length - 1">, </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center mt-5 pt-4 text-muted small fw-bold" style="opacity: 0.6;">
                My Champs Manager
            </div>

        </div>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BButton, BSpinner } from 'bootstrap-vue-next';

export default {
    name: 'RelatorioImpressao',
    components: { BButton, BSpinner },
    data() {
        return {
            id: '',
            campeonato: null,
            carregando: true
        }
    },
    computed: {
        totalJogos() {
            return this.campeonato?.jogos?.length || 0;
        },
        totalGols() {
            if (!this.campeonato) return 0;
            return this.campeonato.jogos.reduce((acc, j) => acc + (j.golsA || 0) + (j.golsB || 0), 0);
        },
        mediaGols() {
            if (!this.totalJogos) return 0;
            return (this.totalGols / this.totalJogos).toFixed(2);
        },
        jogosAgrupados() {
            if (!this.campeonato) return {};
            const grupos = {};
            
            const jogosOrdenados = [...this.campeonato.jogos].sort((a, b) => a.id - b.id);

            jogosOrdenados.forEach(jogo => {
                let chave = '';
                if (jogo.fase) {
                    chave = jogo.fase;
                    if(jogo.turno && this.campeonato.turnos > 1) chave += ` (Jogo ${jogo.turno})`;
                } else {
                    chave = `Rodada ${jogo.rodada}`;
                }

                if (!grupos[chave]) grupos[chave] = [];
                grupos[chave].push(jogo);
            });
            return grupos;
        }
    },
    async mounted() {
        this.id = this.$route.params.id;
        await this.carregar();
    },
    methods: {
        async carregar() {
            try {
                this.campeonato = await DbService.getCampeonatoById(this.id);
            } catch (e) {
                alert("Erro ao carregar");
            } finally {
                this.carregando = false;
            }
        },
        imprimir() {
            window.print();
        },
        formatarTituloGrupo(chave) {
            return chave;
        },
        getEstadio(timeId) {
            const time = this.campeonato.timesParticipantes.find(t => t.id === timeId);
            return time ? time.estadio : 'Campo Neutro';
        },
        formatarData(dataIso) {
            if (!dataIso) return '--/--/----';
            // ADICIONADO O ANO (year: 'numeric')
            return new Date(dataIso).toLocaleString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        },
        temEventosRelevantes(jogo) {
            if (!jogo.eventos) return false;
            return jogo.eventos.some(e => ['GOL', 'VERMELHO'].includes(e.tipo));
        },
        getEventosPorTipo(jogo, tipo) {
            if (!jogo.eventos) return [];
            return jogo.eventos.filter(e => e.tipo === tipo);
        },
        getNomeJogador(evento, jogo) {
            if (evento.jogador && evento.jogador.nome) return evento.jogador.nome;
            return 'Desconhecido';
        },
        getSiglaTime(timeId, jogo) {
            if (timeId === jogo.timeA.id) return jogo.timeA.nome.substring(0,3).toUpperCase();
            if (timeId === jogo.timeB.id) return jogo.timeB.nome.substring(0,3).toUpperCase();
            return '';
        }
    }
}
</script>

<style scoped>
/* Estilos visuais para a tela */
.folha-a4 {
    max-width: 210mm;
    min-height: 297mm;
    background: white;
    /* Sombra suave apenas para visualização em tela */
    box-shadow: 0 0 15px rgba(0,0,0,0.05); 
}

.escudo-print {
    width: 30px;
    height: 30px;
    object-fit: contain;
    vertical-align: middle;
}

/* Regras de Impressão */
@media print {
    @page {
        margin: 10mm;
        size: A4;
    }

    body {
        background: white !important;
        /* Removemos a cor preta forçada (#000), deixando o navegador 
           usar as cores do Bootstrap (text-dark, text-secondary) */
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .d-print-none, header, nav, footer, .navbar {
        display: none !important;
    }

    .relatorio-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        margin: 0;
        padding: 0;
    }

    .folha-a4 {
        box-shadow: none;
        max-width: 100%;
        padding: 0 !important;
        margin: 0 !important;
    }

    .keep-together {
        break-inside: avoid;
        page-break-inside: avoid;
    }
    
    /* Fundo leve para o box de estatísticas e placar */
    .bg-light {
        background-color: #f8f9fa !important;
    }
}
</style>