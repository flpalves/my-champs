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
                    <div v-if="!editandoNome" @dblclick="ativarEdicaoNome" class="cursor-pointer"
                        title="Duplo clique para editar nome">
                        <h2 class="text-primary fw-bold mb-0">
                            {{ campeonato.nome }}
                            <span class="fs-6 text-muted ms-2 opacity-50 d-none d-md-inline-block">✎</span>
                            <BBadge v-if="campeonato.status === 'ENCERRADO'" variant="dark" class="ms-2 fs-6">🏆
                                ENCERRADO</BBadge>
                        </h2>
                        <span class="text-muted small">
                            {{ campeonato.timesParticipantes.length }} Times • {{ totalRodadas }} Rodadas
                        </span>
                    </div>

                    <div v-else class="d-flex align-items-center gap-2">
                        <BFormInput v-model="nomeTemp" size="lg" class="fw-bold text-primary" style="max-width: 400px;"
                            @keyup.enter="salvarNome" auto-focus />
                        <BButton size="sm" variant="success" @click="salvarNome">✔</BButton>
                        <BButton size="sm" variant="outline-secondary" @click="cancelarEdicaoNome">✖</BButton>
                    </div>
                </div>

                <div class="d-flex gap-2 ms-3">
                    <BButton variant="outline-secondary" @click="$router.push('/lista-campeonatos')">
                        Voltar
                    </BButton>
                    <BButton v-if="campeonato.status === 'ENCERRADO'" variant="outline-warning"
                        @click="$router.push(`/campeonato/${campeonato.id}/imprimir`)" title="Gerar PDF">
                        🖨️ Imprimir
                    </BButton>
                    <BButton v-if="podeEncerrarCampeonato" variant="dark" class="text-warning fw-bold border-warning"
                        @click="encerrarCampeonato">
                        🏆 Encerrar Campeonato
                    </BButton>
                    
                    <BButton v-if="podeEncerrarFase" variant="success" @click="abrirModalEncerramento">
                        Encerrar Fase 🏁
                    </BButton>
                    
                    <BButton v-if="podeEncerrarGrupos" variant="warning" @click="confirmarFimGrupos">
                        Encerrar Grupos 🏆
                    </BButton>

                    <BButton v-if="podeEncerrarFaseInicialLiga" variant="warning" @click="confirmarFimFaseInicialLiga">
                        Encerrar 1ª Fase 🏆
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
                    <BPagination v-model="rodadaAtual" :total-rows="totalRodadas" :per-page="1" prev-text="Anterior"
                        next-text="Próxima" hide-goto-end-buttons class="m-0" />
                </div>
                <hr />
                <div class="lista-jogos">
                    <div v-if="jogosDaRodada.length === 0" class="text-center text-muted py-3">
                        Nenhum jogo nesta rodada.
                    </div>

                    <div v-for="jogo in jogosDaRodada" :key="jogo.id"
                        class="jogo-row py-3 border-bottom align-items-center">
                        <BRow class="w-100 m-0 align-items-center">
                            <BCol cols="4" md="4" class="text-end px-1">
                                <div class="d-flex align-items-center justify-content-end gap-2">
                                    <span class="fw-bold d-none d-md-block text-truncate">{{ jogo.timeA.nome }}</span>
                                    <span class="fw-bold d-md-none">{{ getSigla(jogo.timeA) }}</span>
                                    <img :src="jogo.timeA.escudo"
                                        style="width: 30px; height: 30px; object-fit: contain;"
                                        onerror="this.style.display='none'" />
                                </div>
                                <div class="mt-1 text-muted small lh-1 text-truncate" style="font-size: 0.7rem;">
                                    <span v-for="(autor, idx) in getAutoresGols(jogo, jogo.timeA.id)" :key="idx"
                                        class="d-block">{{ autor }} ⚽</span>
                                </div>
                            </BCol>
                            <BCol cols="4" md="2" class="px-0">
                                <div class="d-flex justify-content-center align-items-center gap-1">
                                    <BFormInput type="number" v-model.number="jogo.golsA"
                                        class="text-center p-0 m-0 fw-bold" style="width: 40px; height: 35px;"
                                        :class="{ 'border-success': jogo.finalizado }"
                                        :disabled="campeonato.status === 'ENCERRADO'" />
                                    <span class="fw-bold text-muted mx-1">X</span>
                                    <BFormInput type="number" v-model.number="jogo.golsB"
                                        class="text-center p-0 m-0 fw-bold" style="width: 40px; height: 35px;"
                                        :class="{ 'border-success': jogo.finalizado }"
                                        :disabled="campeonato.status === 'ENCERRADO'" />
                                </div>
                                <div class="text-center text-muted small mt-1 text-truncate"
                                    style="font-size: 0.65rem;">
                                    🏟️ {{ getEstadio(jogo.timeA.id) }}
                                </div>
                            </BCol>
                            <BCol cols="4" md="4" class="text-start px-1">
                                <div class="d-flex align-items-center justify-content-start gap-2">
                                    <img :src="jogo.timeB.escudo"
                                        style="width: 30px; height: 30px; object-fit: contain;"
                                        onerror="this.style.display='none'" />
                                    <span class="fw-bold d-none d-md-block text-truncate">{{ jogo.timeB.nome }}</span>
                                    <span class="fw-bold d-md-none">{{ getSigla(jogo.timeB) }}</span>
                                </div>
                                <div class="mt-1 text-muted small lh-1 text-truncate" style="font-size: 0.7rem;">
                                    <span v-for="(autor, idx) in getAutoresGols(jogo, jogo.timeB.id)" :key="idx"
                                        class="d-block">⚽ {{ autor }}</span>
                                </div>
                            </BCol>
                            <BCol cols="12" md="2" class="text-center text-md-end mt-2 mt-md-0 px-1">
                                <div class="d-flex justify-content-center justify-content-md-end gap-1">
                                    <BButton size="sm" :variant="jogo.finalizado ? 'success' : 'outline-primary'"
                                        class="py-1 px-2" title="Salvar Resultado" @click="salvarPlacar(jogo)"
                                        :disabled="campeonato.status === 'ENCERRADO'">
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
                    Confira os vencedores. Em caso de empate, selecione quem avança.
                </BAlert>
                <div v-for="confronto in confrontosEncerramento" :key="confronto.id"
                    class="border rounded p-3 mb-3 bg-dark">
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
                            <BFormSelect v-model="confronto.vencedorId" :options="opcoesVencedor(confronto)"
                                :class="{ 'border-danger': !confronto.vencedorId }" />
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
    gerarJogosComByeSystem
} from '../utils/GeradorTabela.js';

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
            editandoNome: false,
            nomeTemp: '',
            modalEncerramentoAberto: false,
            confrontosEncerramento: [],
            
            // Controle para salvar a rodada sem travar o banco
            timerSalvarRodada: null 
        }
    },
    watch: {
        // Observa mudanças na rodada para salvar o histórico
        rodadaAtual(novaRodada) {
            if (!this.campeonato || this.carregando) return;

            // Atualiza localmente
            this.campeonato.ultimaRodadaVista = novaRodada;

            // Debounce: Aguarda 1 segundo após a última mudança para salvar no banco
            if (this.timerSalvarRodada) clearTimeout(this.timerSalvarRodada);
            
            this.timerSalvarRodada = setTimeout(() => {
                // Salva silenciosamente (sem loading spinner)
                DbService.atualizarCampeonato(this.campeonato).catch(err => console.error("Erro ao salvar rodada:", err));
            }, 1000);
        }
    },
    computed: {
        totalRodadas() {
            if (!this.campeonato || !this.campeonato.jogos || this.campeonato.jogos.length === 0) return 1;
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
            if (this.campeonato.status === 'ENCERRADO') return false;

            const ehMataMataNativo = (this.campeonato && this.campeonato.tipo === 'MATA_MATA');
            const faseAtual = this.nomeFaseAtual;
            const ehMataMataDeGrupos = (this.campeonato && this.campeonato.tipo === 'GRUPOS' && faseAtual);

            if (!ehMataMataNativo && !ehMataMataDeGrupos) return false;
            if (!faseAtual) return false;

            let jogosDaFase = [];

            if (faseAtual.includes('Playoff') || faseAtual.includes('Preliminar') || faseAtual.includes('Bye') || faseAtual.includes('Classificação Direta')) {
                jogosDaFase = this.campeonato.jogos.filter(j =>
                    j.fase && (
                        j.fase.includes('Playoff') ||
                        j.fase.includes('Preliminar') ||
                        j.fase.includes('Bye') ||
                        j.fase.includes('Classificação Direta')
                    )
                );
            } else {
                jogosDaFase = this.campeonato.jogos.filter(j => j.fase === faseAtual);
            }

            if (jogosDaFase.length === 0) return false;
            const todosFinalizados = jogosDaFase.every(j => j.finalizado);
            if (faseAtual === 'Final') return false;

            return todosFinalizados;
        },
        podeEncerrarGrupos() {
            if (this.campeonato.status === 'ENCERRADO') return false;
            if (!this.campeonato || this.campeonato.tipo !== 'GRUPOS') return false;
            const jaTemMataMata = this.campeonato.jogos.some(j => j.fase);
            if (jaTemMataMata) return false;
            const todosJogos = this.campeonato.jogos;
            if (todosJogos.length === 0) return false;
            return todosJogos.every(j => j.finalizado);
        },
        podeEncerrarCampeonato() {
            if (!this.campeonato || this.campeonato.status === 'ENCERRADO') return false;
            const jogos = this.campeonato.jogos || [];
            if (jogos.length === 0) return false;
            
            // Lógica para LIGA COM FINAL
            if (this.campeonato.tipo === 'LIGA_COM_FINAL') {
                const jogosFinal = this.campeonato.jogos.filter(j => j.fase === 'Fase Final');
                if (jogosFinal.length === 0) return false;
                return jogosFinal.every(j => j.finalizado);
            }
            
            if (this.campeonato.tipo === 'PONTOS_CORRIDOS') {
                return jogos.every(j => j.finalizado);
            } else {
                const jogosFinal = jogos.filter(j => j.fase && j.fase === 'Final');
                if (jogosFinal.length === 0) return false;
                return jogosFinal.every(j => j.finalizado);
            }
        },
        // Computed para ativar o botão de "Encerrar 1ª Fase"
        podeEncerrarFaseInicialLiga() {
            if (this.campeonato.status === 'ENCERRADO') return false;
            if (this.campeonato.tipo !== 'LIGA_COM_FINAL') return false;

            // Se já tem jogos da "Fase Final", não mostra botão de encerrar fase inicial
            const jaTemFinal = this.campeonato.jogos.some(j => j.fase === 'Fase Final');
            if (jaTemFinal) return false;

            // Todos os jogos atuais devem estar finalizados
            return this.campeonato.jogos.every(j => j.finalizado);
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
                    
                    // NOVA LÓGICA: Restaura a última rodada vista
                    if (this.campeonato.ultimaRodadaVista) {
                        // Verifica se a rodada ainda é válida (caso tenha deletado fases, etc)
                        if(this.campeonato.ultimaRodadaVista <= this.totalRodadas) {
                            this.rodadaAtual = this.campeonato.ultimaRodadaVista;
                        } else {
                            this.rodadaAtual = 1;
                        }
                    } else {
                        this.rodadaAtual = 1;
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar:", error);
            } finally {
                this.carregando = false;
            }
        },
        async encerrarCampeonato() {
            if (!confirm("Deseja declarar este campeonato como ENCERRADO e arquivá-lo?")) return;
            try {
                this.campeonato.status = 'ENCERRADO';
                await DbService.atualizarCampeonato(this.campeonato);
                alert("Campeonato encerrado com sucesso! 🏆");
            } catch (error) { console.error(error); alert("Erro ao encerrar."); }
        },
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
            } catch (error) { console.error(error); alert("Erro ao renomear."); }
        },
        getSigla(time) {
            const timeCompleto = this.campeonato.timesParticipantes.find(t => t.id === time.id);
            if (timeCompleto && timeCompleto.sigla) return timeCompleto.sigla;
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
                if (evento.jogador && evento.jogador.nome) return evento.jogador.nome;
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
        abrirModalEncerramento() {
            const faseAtual = this.nomeFaseAtual;

            let jogosDaFase = [];

            if (faseAtual.includes('Playoff') || faseAtual.includes('Preliminar') || faseAtual.includes('Bye') || faseAtual.includes('Classificação Direta')) {
                jogosDaFase = this.campeonato.jogos.filter(j =>
                    j.fase && (
                        j.fase.includes('Playoff') ||
                        j.fase.includes('Preliminar') ||
                        j.fase.includes('Bye') ||
                        j.fase.includes('Classificação Direta')
                    )
                );
            } else {
                jogosDaFase = this.campeonato.jogos.filter(j => j.fase === faseAtual);
            }

            const mapaConfrontos = {};

            jogosDaFase.forEach(jogo => {
                if (!mapaConfrontos[jogo.confrontoId]) {
                    const nomeFase = jogo.fase || '';

                    mapaConfrontos[jogo.confrontoId] = {
                        id: jogo.confrontoId,
                        timeA: jogo.timeA,
                        timeB: jogo.timeB,
                        placarA: 0,
                        placarB: 0,
                        vencedorId: null,
                        isBye: nomeFase.includes('Bye') || nomeFase.includes('Classificação Direta')
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

                if (conf.isBye) {
                    conf.vencedorId = conf.timeA.id;
                }
            });

            const listaConfrontos = Object.values(mapaConfrontos);
            const tipoClassificacao = this.campeonato.tipoClassificacao || 'AUTOMATICA';

            listaConfrontos.forEach(conf => {
                if (conf.isBye) return;

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
            if (pendentes) { alert("Selecione todos os vencedores."); return; }
            const vencedoresObj = this.confrontosEncerramento.map(conf => {
                if (conf.vencedorId == conf.timeA.id) return conf.timeA;
                if (conf.vencedorId == conf.timeB.id) return conf.timeB;
                return null;
            }).filter(v => v !== null);
            try {
                this.carregando = true;
                await DbService.avancarFaseMataMata(this.campeonato.id, vencedoresObj);
                this.modalEncerramentoAberto = false;
                alert("Nova fase gerada com sucesso!");
                await this.carregarCampeonato();
            } catch (error) { console.error(error); alert("Erro ao gerar nova fase."); }
            finally { this.carregando = false; }
        },

        // --- MÉTODOS PARA LIGA COM FINAL ---

        async confirmarFimFaseInicialLiga() {
            // 1. Pergunta as configurações NOVAMENTE para garantir
            const padraoClassificados = this.campeonato.qtdClassificados || 4;
            const inputQtd = prompt(`Quantos times devem avançar para a Fase Final?`, padraoClassificados);
            if (inputQtd === null) return; // Cancelou
            
            const qtdClassificados = parseInt(inputQtd);
            if (isNaN(qtdClassificados) || qtdClassificados < 2) return alert("Número inválido de classificados.");

            const padraoTurnos = this.campeonato.turnosFaseFinal || 1;
            const inputTurnos = prompt(`Quantos turnos na Fase Final? (1 = Único, 2 = Ida e Volta)`, padraoTurnos);
            if(inputTurnos === null) return;
            const turnosFinal = parseInt(inputTurnos);
            if(turnosFinal !== 1 && turnosFinal !== 2) return alert("Turnos devem ser 1 ou 2.");

            const inputZerar = confirm(`Deseja ZERAR a pontuação para a fase final?\n\n[OK] = Sim, zerar pontos.\n[Cancelar] = Não, manter pontos acumulados.`);
            const zerarPontos = inputZerar;

            // 2. Atualiza o objeto campeonato com o que o usuário acabou de confirmar
            this.campeonato.qtdClassificados = qtdClassificados;
            this.campeonato.turnosFaseFinal = turnosFinal;
            this.campeonato.zerarPontos = zerarPontos;

            // 3. Calcula e Gera
            const classificacao = this.calcularClassificacaoUnificada();
            const classificados = classificacao.slice(0, qtdClassificados);

            if (!confirm(`Confirmação Final:\n\nAvamçam: ${qtdClassificados} times\nTurnos: ${turnosFinal}\nPontos: ${zerarPontos ? 'ZERADOS' : 'ACUMULADOS'}\n\nTimes: ${classificados.map(t=>t.nome).join(', ')}`)) return;

            try {
                this.carregando = true;
                // Salva as configurações atualizadas antes de avançar
                await DbService.atualizarCampeonato(this.campeonato);
                
                await DbService.avancarLigaParaFaseFinal(this.campeonato.id, classificados);
                alert("Fase Final gerada com sucesso!");
                await this.carregarCampeonato();
                // O watch vai salvar o novo totalRodadas como ultimaRodadaVista automaticamente
                this.rodadaAtual = this.totalRodadas; 
            } catch (error) {
                console.error(error);
                alert("Erro ao gerar fase final.");
            } finally {
                this.carregando = false;
            }
        },

        // Classificação Unificada
        calcularClassificacaoUnificada() {
            const mapaStats = {};
            this.campeonato.timesParticipantes.forEach(t => {
                mapaStats[t.id] = { ...t, pontos: 0, vitorias: 0, saldoGols: 0, golsPro: 0, jogos: 0 };
            });

            const temFaseFinal = this.campeonato.jogos.some(j => j.fase === 'Fase Final');
            // IMPORTANTE: Lê o valor atualizado (pode ter sido mudado no prompt acima se ainda não salvou, mas aqui lê do data)
            const zerar = this.campeonato.zerarPontos;

            const jogosParaConsiderar = this.campeonato.jogos.filter(jogo => {
                if (!jogo.finalizado) return false;
                const isFaseFinal = jogo.fase === 'Fase Final';
                const isFase1 = !jogo.fase;
                return zerar ? isFaseFinal : (isFaseFinal || isFase1);
            });

            jogosParaConsiderar.forEach(jogo => {
                const tA = mapaStats[jogo.timeA.id];
                const tB = mapaStats[jogo.timeB.id];
                if (tA) {
                    tA.jogos++; tA.golsPro += (jogo.golsA || 0); tA.golsContra += (jogo.golsB || 0);
                    if (jogo.golsA > jogo.golsB) { tA.pontos += 3; tA.vitorias++; }
                    else if (jogo.golsB > jogo.golsA) { } 
                    else { tA.pontos += 1; }
                    tA.saldoGols = tA.golsPro - tA.golsContra;
                }
                if (tB) {
                    tB.jogos++; tB.golsPro += (jogo.golsB || 0); tB.golsContra += (jogo.golsA || 0);
                    if (jogo.golsB > jogo.golsA) { tB.pontos += 3; tB.vitorias++; }
                    else if (jogo.golsA > jogo.golsB) { }
                    else { tB.pontos += 1; }
                    tB.saldoGols = tB.golsPro - tB.golsContra;
                }
            });

            let lista = Object.values(mapaStats);
            
            if (temFaseFinal && zerar) {
                const idsFinalistas = new Set();
                this.campeonato.jogos.filter(j => j.fase === 'Fase Final').forEach(j => { 
                    idsFinalistas.add(j.timeA.id); 
                    idsFinalistas.add(j.timeB.id); 
                });
                lista = lista.filter(t => idsFinalistas.has(t.id));
            }

            return lista.sort((a, b) => {
                if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
                return b.saldoGols - a.saldoGols;
            });
        },

        // --- FIM MÉTODOS LIGA COM FINAL ---

        async confirmarFimGrupos() {
            // 1. Cálculos Básicos
            const classificacao = this.calcularClassificacaoGrupos();
            const qtdDiretos = this.campeonato.classificadosPorGrupo || 2;
            let modoKnockout = this.campeonato.modoKnockout || 'PADRAO';

            let timesClassificados = [];
            for (const nomeGrupo in classificacao) {
                const grupo = classificacao[nomeGrupo];
                timesClassificados.push(...grupo.slice(0, qtdDiretos));
            }

            const totalClassificados = timesClassificados.length;
            const logBase2 = Math.log2(totalClassificados);
            const ehPotenciaPerfeita = Number.isInteger(logBase2);

            // DETECÇÃO DE MODO PARA CAMPEONATOS ANTIGOS
            if (modoKnockout === 'PADRAO' && !ehPotenciaPerfeita) {
                if ([6, 12, 24, 48].includes(totalClassificados)) {
                    const desejaBye = confirm(
                        `⚠️ DETECTADO: Você tem ${totalClassificados} classificados.\n\n` +
                        `O modo atual é "PADRÃO". Deseja mudar para o Sistema "BYE" agora?`
                    );
                    if (desejaBye) modoKnockout = 'BYE';
                }
            }

            // SISTEMA DE BYE / PLAYOFFS
            if (modoKnockout === 'BYE') {
                if (totalClassificados < 3) { alert("Poucos times para sistema de Bye."); return; }
                if (!confirm(`CONFIRMAÇÃO SISTEMA DE BYE:\nExistem ${totalClassificados} classificados.\nDeseja confirmar?`)) return;

                try {
                    this.carregando = true;
                    const novosJogos = gerarJogosComByeSystem(
                        timesClassificados,
                        this.campeonato.turnos,
                        this.totalRodadas
                    )
                    this.campeonato.jogos.push(...novosJogos);
                    this.campeonato.modoKnockout = 'BYE';
                    await DbService.atualizarCampeonato(this.campeonato);
                    alert("Fase Preliminar e Byes gerados com sucesso!");
                    await this.carregarCampeonato();
                    this.rodadaAtual = this.totalRodadas;
                } catch (e) {
                    console.error(e);
                    alert("Erro ao gerar sistema Bye.");
                } finally {
                    this.carregando = false;
                }
                return; 
            }

            // PADRÃO (REPESCAGEM)
            let usarRepescagem = this.campeonato.usarRepescagem || false;
            let timesRestantes = [];

            for (const nomeGrupo in classificacao) {
                const grupo = classificacao[nomeGrupo];
                timesRestantes.push(...grupo.slice(qtdDiretos));
            }

            if (!ehPotenciaPerfeita && !usarRepescagem) {
                const proximaPotencia = Math.pow(2, Math.ceil(Math.log2(totalClassificados)));
                const faltam = proximaPotencia - totalClassificados;
                if (confirm(`⚠️ MODO PADRÃO:\nDeseja ativar a REPESCAGEM agora para classificar mais ${faltam} times?`)) {
                    usarRepescagem = true;
                }
            }

            let timesExtras = [];
            if (usarRepescagem) {
                const proximaPotencia = Math.pow(2, Math.ceil(Math.log2(totalClassificados)));
                const vagasFaltantes = proximaPotencia - totalClassificados;
                if (vagasFaltantes > 0) {
                    if (vagasFaltantes > timesRestantes.length) {
                        alert(`Erro: Precisamos de ${vagasFaltantes} times extra, mas só temos ${timesRestantes.length}.`);
                        return;
                    }
                    timesRestantes.sort((a, b) => {
                        if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
                        return b.saldoGols - a.saldoGols;
                    });
                    timesExtras = timesRestantes.slice(0, vagasFaltantes);
                }
            }

            let msg = "Isso encerrará a fase de grupos e gerará o Mata-Mata.";
            if (timesExtras.length > 0) msg += `\n\nℹ️ REPESCAGEM: + ${timesExtras.length} melhores 3ºs classificados.`;

            if (!confirm(msg)) return;

            try {
                this.carregando = true;
                const ultimaRodadaAntiga = this.totalRodadas;

                if (usarRepescagem || timesExtras.length > 0) {
                    const listaFinal = [...timesClassificados, ...timesExtras];
                    await DbService.avancarGruposComSeeding(this.campeonato.id, listaFinal);
                } else {
                    const classificadosPorGrupoObj = {};
                    for (const nome in classificacao) {
                        classificadosPorGrupoObj[nome] = classificacao[nome].slice(0, qtdDiretos);
                    }
                    await DbService.avancarGruposParaMataMata(this.campeonato.id, classificadosPorGrupoObj);
                }

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
            if (this.campeonato.tipo === 'LIGA_COM_FINAL') {
                return { 'Tabela': this.calcularClassificacaoUnificada() };
            }

            const mapaStats = {};
            this.campeonato.timesParticipantes.forEach(t => {
                mapaStats[t.id] = { ...t, pontos: 0, vitorias: 0, saldoGols: 0, golsPro: 0 };
            });
            this.campeonato.jogos.forEach(jogo => {
                if (!jogo.finalizado) return;
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
                    if (!gruposObj[grupoDoTime.nome]) gruposObj[grupoDoTime.nome] = [];
                    gruposObj[grupoDoTime.nome].push(timeStats);
                }
            });
            for (const nome in gruposObj) {
                gruposObj[nome].sort((a, b) => {
                    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
                    if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
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
input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type=number] {
    -moz-appearance: textfield;
}

.jogo-row:last-child {
    border-bottom: none !important;
}

.cursor-pointer {
    cursor: pointer;
}

.form-control:disabled {
    opacity: 0.25;
    color: #000;
}
</style>