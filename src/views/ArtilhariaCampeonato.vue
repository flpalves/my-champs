<template>
    <div class="container mt-4">

        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Calculando artilharia..." />
        </div>

        <div v-else-if="!campeonato">
            <BAlert show variant="danger">Campeonato não encontrado.</BAlert>
            <BButton @click="$router.push('/lista-campeonatos')">Voltar</BButton>
        </div>

        <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="text-primary fw-bold mb-0">Artilharia</h2>
                    <span class="text-muted">{{ campeonato.nome }}</span>
                </div>
                <BButton variant="outline-secondary" @click="$router.push(`/campeonato/${id}`)">
                    Voltar para Jogos
                </BButton>
            </div>

            <BCard class="shadow-sm p-0 overflow-hidden">

                <div v-if="rankingArtilheiros.length === 0" class="text-center py-5 text-muted">
                    <h4>Nenhum gol marcado ainda.</h4>
                    <p>A lista de artilheiros aparecerá assim que os primeiros gols forem registrados nas súmulas.</p>
                </div>

                <div v-else>
                    <BTableSimple hover responsive striped class="mb-0 align-middle">
                        <BThead variant="dark">
                            <BTr>
                                <BTh class="text-center" style="width: 80px;">Pos</BTh>
                                <BTh>Jogador</BTh>
                                <BTh>Time</BTh>
                                <BTh class="text-center" style="width: 100px;">Gols</BTh>
                            </BTr>
                        </BThead>
                        <BTbody>
                            <BTr v-for="(jogador, index) in artilheirosPaginados" :key="jogador.chaveUnica">

                                <BTd class="text-center fw-bold text-muted">
                                    {{ (paginaAtual - 1) * itensPorPagina + index + 1 }}º
                                    <span v-if="((paginaAtual - 1) * itensPorPagina + index) === 0">🥇</span>
                                    <span v-else-if="((paginaAtual - 1) * itensPorPagina + index) === 1">🥈</span>
                                    <span v-else-if="((paginaAtual - 1) * itensPorPagina + index) === 2">🥉</span>
                                </BTd>

                                <BTd class="fw-bold">{{ jogador.nome }}</BTd>

                                <BTd>
                                    <div class="d-flex align-items-center">
                                        <img :src="jogador.escudoTime" class="me-2"
                                            style="width: 30px; height: 30px; object-fit: contain;"
                                            onerror="this.style.display='none'" />
                                        <span class="small text-muted">{{ jogador.nomeTime }}</span>
                                    </div>
                                </BTd>

                                <BTd class="text-center">
                                    <span class="badge bg-success fs-6">{{ jogador.gols }}</span>
                                </BTd>

                            </BTr>
                        </BTbody>
                    </BTableSimple>
                </div>
            </BCard>

            <div class="d-flex justify-content-center mt-4" v-if="rankingArtilheiros.length > itensPorPagina">
                <BPagination v-model="paginaAtual" :total-rows="rankingArtilheiros.length" :per-page="itensPorPagina"
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
    props: {
        // id: { type: [String, Number], required: true }
    },
    data() {
        return {
            id: '',
            carregando: true,
            campeonato: null,
            rankingArtilheiros: [], // Lista completa ordenada

            // Paginação
            paginaAtual: 1,
            itensPorPagina: 20
        }
    },
    computed: {
        artilheirosPaginados() {
            const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
            const fim = inicio + this.itensPorPagina;
            return this.rankingArtilheiros.slice(inicio, fim);
        }
    },
    async mounted() {
        this.id = this.$route.params.id;
        await this.carregarECalcular();
    },
    methods: {
        async carregarECalcular() {
            this.carregando = true;
            try {
                const camp = await DbService.getCampeonatoById(this.id);
                if (camp) {
                    this.campeonato = camp;
                    this.calcularArtilharia(camp);
                }
            } catch (error) {
                console.error("Erro ao calcular artilharia:", error);
            } finally {
                this.carregando = false;
            }
        },

        calcularArtilharia(camp) {
            const mapaGols = {}; // Chave será "timeId_jogadorId"

            // 1. Iterar sobre todos os jogos e eventos
            if (camp.jogos) {
                camp.jogos.forEach(jogo => {
                    if (jogo.eventos) {
                        jogo.eventos.forEach(evento => {
                            if (evento.tipo === 'GOL') {
                                // Cria uma chave única combinando Time e Jogador
                                const chave = `${evento.timeId}_${evento.jogadorId}`;

                                if (!mapaGols[chave]) {
                                    mapaGols[chave] = {
                                        timeId: evento.timeId,
                                        jogadorId: evento.jogadorId,
                                        // CORREÇÃO: Salva o nome do snapshot (evento) se existir
                                        nomeSnapshot: evento.jogador ? evento.jogador.nome : null,
                                        gols: 0
                                    };
                                }
                                mapaGols[chave].gols++;
                            }
                        });
                    }
                });
            }

            // 2. Enriquecer os dados (Buscar Nome e Escudo)
            const listaFinal = Object.values(mapaGols).map(item => {
                // Busca o time na lista de participantes
                const time = camp.timesParticipantes.find(t => t.id === item.timeId);

                // CORREÇÃO: Usa o nome salvo no evento como padrão. Se não tiver, vira "Desconhecido"
                let nomeJogador = item.nomeSnapshot || 'Desconhecido';
                let nomeTime = 'Time Removido';
                let escudoTime = '';

                if (time) {
                    nomeTime = time.nome;
                    escudoTime = time.escudo;

                    // Fallback: Se o nome não veio no evento (dados antigos), tenta buscar no elenco atual
                    if (nomeJogador === 'Desconhecido') {
                        const jogador = time.jogadores.find(j => (j.id || j.numero) == item.jogadorId);
                        if (jogador) {
                            nomeJogador = jogador.nome;
                        }
                    }
                }

                return {
                    chaveUnica: `${item.timeId}_${item.jogadorId}`,
                    nome: nomeJogador,
                    nomeTime: nomeTime,
                    escudoTime: escudoTime,
                    gols: item.gols
                };
            });

            // 3. Ordenar (Maior número de gols primeiro)
            // Desempate: Ordem alfabética do nome
            this.rankingArtilheiros = listaFinal.sort((a, b) => {
                if (b.gols !== a.gols) return b.gols - a.gols;
                return a.nome.localeCompare(b.nome);
            });
        }
    }
}
</script>