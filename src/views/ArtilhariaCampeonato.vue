<template>
    <div class="container mt-4">

        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Carregando estatísticas..." />
        </div>

        <div v-else-if="!campeonato">
            <BAlert show variant="danger">Campeonato não encontrado.</BAlert>
            <BButton @click="$router.push('/lista-campeonatos')">Voltar</BButton>
        </div>

        <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="text-primary fw-bold mb-0">Estatísticas</h2>
                    <span class="text-muted">{{ campeonato.nome }}</span>
                </div>
                <BButton variant="outline-secondary" @click="$router.push(`/campeonato/${id}`)">
                    Voltar para Jogos
                </BButton>
            </div>

            <ul class="nav nav-tabs nav-justified mb-3">
                <li class="nav-item">
                    <a class="nav-link cursor-pointer" 
                       :class="{ active: abaAtiva === 'GOLS', 'fw-bold': abaAtiva === 'GOLS' }"
                       @click.prevent="mudarAba('GOLS')">
                        ⚽ Artilharia
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link cursor-pointer" 
                       :class="{ active: abaAtiva === 'CRAQUES', 'fw-bold': abaAtiva === 'CRAQUES' }"
                       @click.prevent="mudarAba('CRAQUES')">
                        ⭐ Melhores Jogadores (MVP)
                    </a>
                </li>
            </ul>

            <BCard class="shadow-sm p-0 overflow-hidden">

                <div v-if="listaExibida.length === 0" class="text-center py-5 text-muted">
                    <h4 v-if="abaAtiva === 'GOLS'">Nenhum gol marcado ainda.</h4>
                    <h4 v-else>Nenhum craque eleito ainda.</h4>
                    <p>Os dados aparecerão assim que os jogos forem realizados.</p>
                </div>

                <div v-else>
                    <BTableSimple hover responsive striped class="mb-0 align-middle">
                        <BThead variant="dark">
                            <BTr>
                                <BTh class="text-center" style="width: 80px;">Pos</BTh>
                                <BTh>Jogador</BTh>
                                <BTh>Time</BTh>
                                <BTh class="text-center" style="width: 120px;">
                                    {{ abaAtiva === 'GOLS' ? 'Gols' : 'Prêmios' }}
                                </BTh>
                            </BTr>
                        </BThead>
                        <BTbody>
                            <BTr v-for="(jogador, index) in listaPaginada" :key="jogador.chaveUnica">

                                <BTd class="text-center fw-bold text-muted">
                                    {{ (paginaAtual - 1) * itensPorPagina + index + 1 }}º
                                    <span v-if="((paginaAtual - 1) * itensPorPagina + index) === 0">🥇</span>
                                    <span v-else-if="((paginaAtual - 1) * itensPorPagina + index) === 1">🥈</span>
                                    <span v-else-if="((paginaAtual - 1) * itensPorPagina + index) === 2">🥉</span>
                                </BTd>

                                <BTd class="fw-bold">
                                    {{ jogador.nome }}
                                    <span v-if="abaAtiva === 'CRAQUES' && index === 0" class="badge bg-warning text-dark ms-2 small">CRAQUE DA GALERA</span>
                                </BTd>

                                <BTd>
                                    <div class="d-flex align-items-center">
                                        <img :src="jogador.escudoTime" class="me-2"
                                            style="width: 30px; height: 30px; object-fit: contain;"
                                            onerror="this.style.display='none'" />
                                        <span class="small text-muted">{{ jogador.nomeTime }}</span>
                                    </div>
                                </BTd>

                                <BTd class="text-center">
                                    <span class="badge fs-6" :class="abaAtiva === 'GOLS' ? 'bg-success' : 'bg-primary'">
                                        {{ jogador.total }} {{ abaAtiva === 'GOLS' ? '⚽' : '⭐' }}
                                    </span>
                                </BTd>

                            </BTr>
                        </BTbody>
                    </BTableSimple>
                </div>
            </BCard>

            <div class="d-flex justify-content-center mt-4" v-if="listaExibida.length > itensPorPagina">
                <BPagination v-model="paginaAtual" :total-rows="listaExibida.length" :per-page="itensPorPagina"
                    first-number last-number prev-text="Anterior" next-text="Próxima" />
            </div>

        </div>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import {
    BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BAlert, BPagination
} from 'bootstrap-vue-next';

export default {
    name: 'ArtilhariaCampeonato',
    components: {
        BCard, BButton, BSpinner, BTableSimple, BThead, BTbody, BTr, BTh, BTd, BAlert, BPagination
    },
    data() {
        return {
            id: '',
            carregando: true,
            campeonato: null,
            
            // Dados
            rankingArtilheiros: [],
            rankingCraques: [],
            
            // Controle de Interface
            abaAtiva: 'GOLS', // 'GOLS' ou 'CRAQUES'
            paginaAtual: 1,
            itensPorPagina: 20
        }
    },
    computed: {
        // Define qual lista mostrar com base na aba
        listaExibida() {
            return this.abaAtiva === 'GOLS' ? this.rankingArtilheiros : this.rankingCraques;
        },
        // Pagina a lista ativa
        listaPaginada() {
            const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
            const fim = inicio + this.itensPorPagina;
            return this.listaExibida.slice(inicio, fim);
        }
    },
    async mounted() {
        this.id = this.$route.params.id;
        await this.carregarECalcular();
    },
    methods: {
        mudarAba(novaAba) {
            this.abaAtiva = novaAba;
            this.paginaAtual = 1; // Reseta paginação ao trocar de aba
        },

        async carregarECalcular() {
            this.carregando = true;
            try {
                const camp = await DbService.getCampeonatoById(this.id);
                if (camp) {
                    this.campeonato = camp;
                    this.calcularArtilharia(camp);
                    this.calcularCraques(camp); // Calcula o novo ranking
                }
            } catch (error) {
                console.error("Erro ao calcular estatísticas:", error);
            } finally {
                this.carregando = false;
            }
        },

        // --- CÁLCULO DE GOLS ---
        calcularArtilharia(camp) {
            const mapa = {}; 

            if (camp.jogos) {
                camp.jogos.forEach(jogo => {
                    if (jogo.eventos) {
                        jogo.eventos.forEach(evento => {
                            if (evento.tipo === 'GOL') {
                                const chave = `${evento.timeId}_${evento.jogadorId}`;
                                if (!mapa[chave]) {
                                    mapa[chave] = {
                                        timeId: evento.timeId,
                                        jogadorId: evento.jogadorId,
                                        nomeSnapshot: evento.jogador ? evento.jogador.nome : null,
                                        total: 0
                                    };
                                }
                                mapa[chave].total++;
                            }
                        });
                    }
                });
            }
            this.rankingArtilheiros = this.formatarEOrdenar(mapa, camp);
        },

        // --- CÁLCULO DE CRAQUES (NOVO) ---
        calcularCraques(camp) {
            const mapa = {};

            if (camp.jogos) {
                camp.jogos.forEach(jogo => {
                    // Verifica se existe craque definido no jogo
                    // Na Súmula, salvamos em: jogo.craque (objeto) e jogo.craqueTimeId (id)
                    if (jogo.craque && jogo.craqueTimeId) {
                        
                        const chave = `${jogo.craqueTimeId}_${jogo.craque.id}`;
                        
                        if (!mapa[chave]) {
                            mapa[chave] = {
                                timeId: jogo.craqueTimeId,
                                jogadorId: jogo.craque.id,
                                nomeSnapshot: jogo.craque.nome, // Prioriza o nome salvo no momento do jogo
                                total: 0
                            };
                        }
                        mapa[chave].total++; // Incrementa contador de estrelas
                    }
                });
            }
            this.rankingCraques = this.formatarEOrdenar(mapa, camp);
        },

        // --- HELPER COMUM ---
        formatarEOrdenar(mapaDados, camp) {
            // Enriquece os dados com infos do time atual
            const lista = Object.values(mapaDados).map(item => {
                const time = camp.timesParticipantes.find(t => t.id === item.timeId);
                let nomeJogador = item.nomeSnapshot || 'Desconhecido';
                let nomeTime = 'Time Removido';
                let escudoTime = '';

                if (time) {
                    nomeTime = time.nome;
                    escudoTime = time.escudo;
                    // Fallback se não tiver snapshot
                    if (nomeJogador === 'Desconhecido') {
                        const jogador = time.jogadores.find(j => (j.id || j.numero) == item.jogadorId);
                        if (jogador) nomeJogador = jogador.nome;
                    }
                }

                return {
                    chaveUnica: `${item.timeId}_${item.jogadorId}`,
                    nome: nomeJogador,
                    nomeTime: nomeTime,
                    escudoTime: escudoTime,
                    total: item.total
                };
            });

            // Ordena: Maior total -> Nome Alfabético
            return lista.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                return a.nome.localeCompare(b.nome);
            });
        }
    }
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.nav-tabs .nav-link.active {
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
    color: #0d6efd;
}
.nav-tabs .nav-link {
    color: #495057;
}
</style>