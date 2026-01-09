<template>
    <div class="container mt-4">

        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Carregando..." />
        </div>

        <div v-else-if="!campeonato">
            <BAlert show variant="danger">Campeonato não encontrado.</BAlert>
            <BButton @click="$router.push('/lista-campeonatos')">Voltar</BButton>
        </div>

        <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
                
                <div style="flex-grow: 1;">
                    <div v-if="!editandoNome" @dblclick="ativarEdicaoNome" class="cursor-pointer" title="Duplo clique para editar nome">
                        <h2 class="text-primary fw-bold mb-0">
                            {{ campeonato.nome }} 
                            <span class="fs-6 text-muted ms-2 opacity-50 d-none d-md-inline-block">✎</span>
                        </h2>
                        <span class="text-muted small">
                            {{ campeonato.timesParticipantes.length }} Times • {{ totalRodadas }} Rodadas
                        </span>
                    </div>
                    
                    <div v-else class="d-flex align-items-center gap-2">
                        <BFormInput 
                            v-model="nomeTemp" 
                            size="lg" 
                            class="fw-bold text-primary" 
                            style="max-width: 400px;"
                            @keyup.enter="salvarNome" 
                            auto-focus 
                        />
                        <BButton size="sm" variant="success" @click="salvarNome">✔</BButton>
                        <BButton size="sm" variant="outline-secondary" @click="cancelarEdicaoNome">✖</BButton>
                    </div>
                </div>

                <div class="d-flex gap-2 ms-3">
                    <BButton variant="outline-secondary" @click="$router.push('/lista-campeonatos')">
                        Voltar
                    </BButton>

                    <BButton v-if="podeEncerrarFase" variant="success" @click="abrirModalEncerramento">
                        Encerrar Fase 🏁
                    </BButton>

                    <BButton v-if="podeEncerrarGrupos" variant="warning" @click="confirmarFimGrupos">
                        Encerrar Grupos 🏆
                    </BButton>

                    <BButton variant="primary" @click="$router.push(`/campeonato/${campeonato.id}/classificacao`)">
                        Ver Tabela 📊
                    </BButton>
                    <BButton variant="outline-primary" @click="$router.push(`/campeonato/${campeonato.id}/artilharia`)">
                        Artilharia ⚽
                    </BButton>
                </div>
            </div>

            <BCard class="shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="m-0">
                        Rodada {{ rodadaAtual }} 
                        <span v-if="nomeFaseAtual" class="badge bg-info fs-6 ms-2">{{ nomeFaseAtual }}</span>
                    </h4>
                    <BPagination v-model="rodadaAtual" :total-rows="totalRodadas" :per-page="1" prev-text="Anterior" next-text="Próxima" hide-goto-end-buttons class="m-0" />
                </div>
                <hr />
                <div class="lista-jogos">
                    <div v-if="jogosDaRodada.length === 0" class="text-center text-muted py-3">
                        Nenhum jogo nesta rodada.
                    </div>

                    <div v-for="jogo in jogosDaRodada" :key="jogo.id" class="jogo-row py-3 border-bottom align-items-center">
                        <BRow class="w-100 m-0 align-items-center">
                            
                            <BCol cols="4" md="4" class="text-end px-1">
                                <div class="d-flex align-items-center justify-content-end gap-2">
                                    <span class="fw-bold d-none d-md-block text-truncate">{{ jogo.timeA.nome }}</span>
                                    <span class="fw-bold d-md-none">{{ getSigla(jogo.timeA) }}</span>
                                    <img :src="jogo.timeA.escudo" style="width: 30px; height: 30px; object-fit: contain;" onerror="this.style.display='none'" />
                                </div>
                                <div class="mt-1 text-muted small lh-1 text-truncate" style="font-size: 0.7rem;">
                                    <span v-for="(autor, idx) in getAutoresGols(jogo, jogo.timeA.id)" :key="idx" class="d-block">{{ autor }} ⚽</span>
                                </div>
                            </BCol>

                            <BCol cols="4" md="2" class="px-0">
                                <div class="d-flex justify-content-center align-items-center gap-1">
                                    <BFormInput type="number" v-model.number="jogo.golsA" 
                                        class="text-center p-0 m-0 fw-bold" 
                                        style="width: 40px; height: 35px;" 
                                        :class="{ 'border-success': jogo.finalizado }" />
                                    
                                    <span class="fw-bold text-muted mx-1">X</span>
                                    
                                    <BFormInput type="number" v-model.number="jogo.golsB" 
                                        class="text-center p-0 m-0 fw-bold" 
                                        style="width: 40px; height: 35px;" 
                                        :class="{ 'border-success': jogo.finalizado }" />
                                </div>
                                <div class="text-center text-muted small mt-1 text-truncate" style="font-size: 0.65rem;">
                                    🏟️ {{ getEstadio(jogo.timeA.id) }}
                                </div>
                            </BCol>

                            <BCol cols="4" md="4" class="text-start px-1">
                                <div class="d-flex align-items-center justify-content-start gap-2">
                                    <img :src="jogo.timeB.escudo" style="width: 30px; height: 30px; object-fit: contain;" onerror="this.style.display='none'" />
                                    <span class="fw-bold d-none d-md-block text-truncate">{{ jogo.timeB.nome }}</span>
                                    <span class="fw-bold d-md-none">{{ getSigla(jogo.timeB) }}</span>
                                </div>
                                <div class="mt-1 text-muted small lh-1 text-truncate" style="font-size: 0.7rem;">
                                    <span v-for="(autor, idx) in getAutoresGols(jogo, jogo.timeB.id)" :key="idx" class="d-block">⚽ {{ autor }}</span>
                                </div>
                            </BCol>

                            <BCol cols="12" md="2" class="text-center text-md-end mt-2 mt-md-0 px-1">
                                <div class="d-flex justify-content-center justify-content-md-end gap-1">
                                    <BButton size="sm" :variant="jogo.finalizado ? 'success' : 'outline-primary'" 
                                        class="py-1 px-2" title="Salvar Resultado" @click="salvarPlacar(jogo)">
                                        <span v-if="jogo.finalizado">✔</span>
                                        <span v-else>💾</span>
                                    </BButton>

                                    <BButton size="sm" variant="outline-secondary" class="py-1 px-2" 
                                        title="Súmula / Detalhes" @click="irParaSumula(jogo)">
                                        📝
                                    </BButton>
                                </div>
                            </BCol>

                        </BRow>
                    </div>
                </div>
            </BCard>
        </div>

        <BModal v-model="modalEncerramentoAberto" title="Definir Classificados" size="lg" hide-footer>
            <div class="p-2">
                <BAlert show variant="info" class="small">
                    Confira os vencedores dos confrontos.
                </BAlert>
                <div v-for="confronto in confrontosEncerramento" :key="confronto.id" class="border rounded p-3 mb-3 bg-dark">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-muted small">Confronto #{{ confronto.id }}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-center" style="width: 30%;">
                            <span class="d-block fw-bold">{{ confronto.timeA.nome }}</span>
                            <div class="badge bg-secondary">Total: {{ confronto.placarA }}</div>
                        </div>
                        <div class="text-center" style="width: 40%;">
                            <span class="small text-muted d-block mb-1">Quem avança?</span>
                            <BFormSelect v-model="confronto.vencedorId" :options="opcoesVencedor(confronto)" :class="{'border-danger': !confronto.vencedorId}" />
                        </div>
                        <div class="text-center" style="width: 30%;">
                            <span class="d-block fw-bold">{{ confronto.timeB.nome }}</span>
                            <div class="badge bg-secondary">Total: {{ confronto.placarB }}</div>
                        </div>
                    </div>
                </div>
                <div class="d-grid gap-2 mt-4">
                    <BButton variant="success" size="lg" @click="confirmarAvancoFase">
                        Confirmar e Gerar Próxima Fase
                    </BButton>
                </div>
            </div>
        </BModal>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import {
    BCard, BButton, BSpinner, BPagination, BRow, BCol, BFormInput, BAlert, BModal, BFormSelect, BBadge
} from 'bootstrap-vue-next';

export default {
    name: 'DetalhesCampeonato',
    components: {
        BCard, BButton, BSpinner, BPagination, BRow, BCol, BFormInput, BAlert, BModal, BFormSelect, BBadge
    },
    data() {
        return {
            carregando: true,
            campeonato: null,
            rodadaAtual: 1,
            id: '',
            
            // Edição de Nome
            editandoNome: false,
            nomeTemp: '',

            // Mata-mata logic
            modalEncerramentoAberto: false,
            confrontosEncerramento: []
        }
    },
    computed: {
        totalRodadas() {
            if (!this.campeonato || !this.campeonato.jogos) return 1;
            if (this.campeonato.jogos.length === 0) return 1;
            return Math.max(...this.campeonato.jogos.map(j => j.rodada));
        },
        jogosDaRodada() {
            if (!this.campeonato) return [];
            return this.campeonato.jogos.filter(j => j.rodada === this.rodadaAtual);
        },
        nomeFaseAtual() {
            if (this.jogosDaRodada.length > 0) return this.jogosDaRodada[0].fase;
            return '';
        },
        podeEncerrarFase() {
            if (!this.campeonato || this.campeonato.tipo !== 'MATA_MATA') return false;
            
            const faseAtual = this.nomeFaseAtual;
            if(!faseAtual) return false;

            const jogosDaFase = this.campeonato.jogos.filter(j => j.fase === faseAtual);
            if (jogosDaFase.length === 0) return false;

            const todosFinalizados = jogosDaFase.every(j => j.finalizado);
            const confrontosUnicos = new Set(jogosDaFase.map(j => j.confrontoId));
            if (confrontosUnicos.size === 1 && faseAtual.toLowerCase().includes('final')) return false;

            return todosFinalizados;
        },
        podeEncerrarGrupos() {
            if (!this.campeonato || this.campeonato.tipo !== 'GRUPOS') return false;
            const jaTemMataMata = this.campeonato.jogos.some(j => j.fase);
            if(jaTemMataMata) return false;
            const todosJogos = this.campeonato.jogos;
            if(todosJogos.length === 0) return false;
            return todosJogos.every(j => j.finalizado);
        }
    },
    async mounted() {
        this.id = this.$route.params.id
        await this.carregarCampeonato();
    },
    methods: {
        async carregarCampeonato() {
            this.carregando = true;
            try {
                const dados = await DbService.getCampeonatoById(this.id);
                if (dados) {
                    this.campeonato = dados;
                }
            } catch (error) {
                console.error("Erro ao carregar campeonato:", error);
            } finally {
                this.carregando = false;
            }
        },

        // --- EDIÇÃO DE NOME ---
        ativarEdicaoNome() {
            this.nomeTemp = this.campeonato.nome;
            this.editandoNome = true;
        },
        cancelarEdicaoNome() {
            this.editandoNome = false;
        },
        async salvarNome() {
            if (!this.nomeTemp.trim()) return alert("Nome não pode ser vazio.");
            
            this.campeonato.nome = this.nomeTemp;
            try {
                await DbService.atualizarCampeonato(this.campeonato);
                this.editandoNome = false;
            } catch (error) {
                console.error(error);
                alert("Erro ao renomear.");
            }
        },

        // --- HELPER DE SIGLA ---
        getSigla(time) {
            const timeCompleto = this.campeonato.timesParticipantes.find(t => t.id === time.id);
            if (timeCompleto && timeCompleto.sigla) {
                return timeCompleto.sigla;
            }
            return time.nome.substring(0, 3).toUpperCase();
        },

        getEstadio(timeId) {
            if (!this.campeonato || !this.campeonato.timesParticipantes) return '-';
            const time = this.campeonato.timesParticipantes.find(t => t.id === timeId);
            return time ? time.estadio : 'Estádio Desconhecido';
        },
        getAutoresGols(jogo, timeId) {
            if (!jogo.eventos || jogo.eventos.length === 0) return [];
            const eventosGol = jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === timeId);
            return eventosGol.map(evento => {
                const timeCompleto = this.campeonato.timesParticipantes.find(t => t.id === timeId);
                if (!timeCompleto) return 'Desconhecido';
                const jogador = timeCompleto.jogadores.find(j => (j.id || j.numero) == evento.jogadorId);
                return jogador ? jogador.nome : 'Desconhecido';
            });
        },
        irParaSumula(jogo) {
            this.$router.push(`/campeonato/${this.campeonato.id}/jogo/${jogo.id}`);
        },
        async salvarPlacar(jogo) {
            if (jogo.golsA === '' || jogo.golsB === '' || jogo.golsA === null || jogo.golsB === null) {
                alert("Preencha os gols.");
                return;
            }
            try {
                jogo.finalizado = true;
                await DbService.atualizarJogo(this.campeonato.id, jogo);
            } catch (error) {
                console.error("Erro", error);
                alert("Erro ao salvar.");
                jogo.finalizado = false;
            }
        },
        
        // --- MATA MATA ---
        abrirModalEncerramento() {
            const faseAtual = this.nomeFaseAtual;
            const jogosDaFase = this.campeonato.jogos.filter(j => j.fase === faseAtual);
            const mapaConfrontos = {};

            jogosDaFase.forEach(jogo => {
                if (!mapaConfrontos[jogo.confrontoId]) {
                    mapaConfrontos[jogo.confrontoId] = {
                        id: jogo.confrontoId,
                        timeA: jogo.timeA, 
                        timeB: jogo.timeB, 
                        placarA: 0,
                        placarB: 0,
                        vencedorId: null
                    };
                }
                const conf = mapaConfrontos[jogo.confrontoId];
                if (jogo.turno === 1) {
                    conf.placarA += (jogo.golsA || 0);
                    conf.placarB += (jogo.golsB || 0);
                } else {
                    conf.placarB += (jogo.golsA || 0); 
                    conf.placarA += (jogo.golsB || 0);
                }
            });

            const listaConfrontos = Object.values(mapaConfrontos);
            const tipoClassificacao = this.campeonato.tipoClassificacao || 'AUTOMATICA';

            listaConfrontos.forEach(conf => {
                if (tipoClassificacao === 'MANUAL') {
                    conf.vencedorId = null;
                } else {
                    if (conf.placarA > conf.placarB) conf.vencedorId = conf.timeA.id;
                    else if (conf.placarB > conf.placarA) conf.vencedorId = conf.timeB.id;
                    else conf.vencedorId = null;
                }
            });
            this.confrontosEncerramento = listaConfrontos;
            this.modalEncerramentoAberto = true;
        },
        opcoesVencedor(confronto) {
            return [
                { value: null, text: 'Selecione...' },
                { value: confronto.timeA.id, text: confronto.timeA.nome },
                { value: confronto.timeB.id, text: confronto.timeB.nome }
            ];
        },
        async confirmarAvancoFase() {
            const pendentes = this.confrontosEncerramento.some(c => !c.vencedorId);
            if (pendentes) {
                alert("Selecione todos os vencedores.");
                return;
            }
            const vencedoresObj = this.confrontosEncerramento.map(conf => {
                return (conf.vencedorId === conf.timeA.id) ? conf.timeA : conf.timeB;
            });

            try {
                this.carregando = true;
                const ultimaRodadaAntiga = this.totalRodadas;
                await DbService.avancarFaseMataMata(this.campeonato.id, vencedoresObj);
                this.modalEncerramentoAberto = false;
                alert("Nova fase gerada com sucesso!");
                await this.carregarCampeonato();
                this.rodadaAtual = ultimaRodadaAntiga + 1;
            } catch (error) {
                console.error(error);
                alert("Erro ao gerar nova fase.");
            } finally {
                this.carregando = false;
            }
        },

        // --- GRUPOS PARA MATA MATA ---
        async confirmarFimGrupos() {
            if(!confirm("Tem certeza? Isso encerrará a fase de grupos e gerará o Mata-Mata.")) return;

            const classificacao = this.calcularClassificacaoGrupos();
            const classificadosPorGrupo = {};
            const qtdClassificados = this.campeonato.classificadosPorGrupo || 2;

            for(const nomeGrupo in classificacao) {
                classificadosPorGrupo[nomeGrupo] = classificacao[nomeGrupo].slice(0, qtdClassificados);
            }

            try {
                this.carregando = true;
                const ultimaRodadaAntiga = this.totalRodadas;
                await DbService.avancarGruposParaMataMata(this.campeonato.id, classificadosPorGrupo);
                alert("Mata-Mata gerado com sucesso!");
                await this.carregarCampeonato();
                this.rodadaAtual = ultimaRodadaAntiga + 1;
            } catch (error) {
                console.error(error);
                alert("Erro ao gerar mata-mata.");
            } finally {
                this.carregando = false;
            }
        },

        calcularClassificacaoGrupos() {
            const mapaStats = {};
            this.campeonato.timesParticipantes.forEach(t => {
                mapaStats[t.id] = { ...t, pontos: 0, vitorias: 0, saldoGols: 0, golsPro: 0 };
            });

            this.campeonato.jogos.forEach(jogo => {
                if(!jogo.finalizado) return;
                const tA = mapaStats[jogo.timeA.id];
                const tB = mapaStats[jogo.timeB.id];
                
                if (jogo.golsA > jogo.golsB) { tA.pontos += 3; tA.vitorias++; }
                else if (jogo.golsB > jogo.golsA) { tB.pontos += 3; tB.vitorias++; }
                else { tA.pontos += 1; tB.pontos += 1; }

                tA.saldoGols += (jogo.golsA - jogo.golsB);
                tB.saldoGols += (jogo.golsB - jogo.golsA);
                tA.golsPro += jogo.golsA;
                tB.golsPro += jogo.golsB;
            });

            const gruposObj = {};
            this.campeonato.grupos.forEach(g => { gruposObj[g.nome] = [] });

            Object.values(mapaStats).forEach(timeStats => {
                const grupoDoTime = this.campeonato.grupos.find(g => g.times.some(t => t.id === timeStats.id));
                if (grupoDoTime) {
                    if(!gruposObj[grupoDoTime.nome]) gruposObj[grupoDoTime.nome] = [];
                    gruposObj[grupoDoTime.nome].push(timeStats);
                }
            });

            for(const nome in gruposObj) {
                gruposObj[nome].sort((a,b) => {
                    if(b.pontos !== a.pontos) return b.pontos - a.pontos;
                    if(b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
                    return b.saldoGols - a.saldoGols;
                });
            }
            return gruposObj;
        }
    }
}
</script>

<style scoped>
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type=number] { -moz-appearance: textfield; }
.jogo-row:last-child { border-bottom: none !important; }
.cursor-pointer { cursor: pointer; }
</style>