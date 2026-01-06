<template>
    <div class="container mt-4 pb-5">

        <div v-if="carregando" class="text-center py-5">
            <BSpinner variant="primary" label="Carregando..." />
        </div>

        <div v-else-if="!jogo">
            <BAlert show variant="danger">Jogo não encontrado.</BAlert>
            <BButton @click="voltar">Voltar</BButton>
        </div>

        <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <BButton variant="outline-secondary" size="sm" @click="voltar">
                    ← Voltar
                </BButton>
                <span class="text-muted small">Rodada {{ jogo.rodada }}</span>
            </div>

            <BCard class="text-center shadow-sm mb-4 border-secondary bg-dark text-white">
                <div class="d-flex justify-content-center align-items-center mb-3">
                    <div class="text-center mx-3" style="width: 100px;">
                        <div class="position-relative d-inline-block">
                            <img :src="jogo.timeA.escudo" style="height: 50px;" class="mb-1 d-block mx-auto" />
                            <div v-if="jogo.uniformeA" class="uniforme-mini" 
                                 :style="{ backgroundColor: jogo.uniformeA.interno, borderColor: jogo.uniformeA.externo }">
                            </div>
                        </div>
                        <small class="fw-bold text-truncate mt-2 d-block">{{ jogo.timeA.nome }}</small>
                    </div>

                    <div class="d-flex align-items-center px-3 py-2 rounded shadow-sm border border-secondary bg-secondary">
                        <h1 class="m-0 fw-bold text-white">{{ golsA }}</h1>
                        <span class="mx-2 text-white-50">x</span>
                        <h1 class="m-0 fw-bold text-white">{{ golsB }}</h1>
                    </div>

                    <div class="text-center mx-3" style="width: 100px;">
                        <div class="position-relative d-inline-block">
                            <img :src="jogo.timeB.escudo" style="height: 50px;" class="mb-1 d-block mx-auto" />
                            <div v-if="jogo.uniformeB" class="uniforme-mini" 
                                 :style="{ backgroundColor: jogo.uniformeB.interno, borderColor: jogo.uniformeB.externo }">
                            </div>
                        </div>
                        <small class="fw-bold text-truncate mt-2 d-block">{{ jogo.timeB.nome }}</small>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <BFormGroup label="Data do Jogo:" label-cols="auto" class="mb-0 text-white-50">
                        <BFormInput type="datetime-local" v-model="jogo.dataHora" size="sm" class="bg-secondary text-white border-secondary" @change="salvarAlteracoes" />
                    </BFormGroup>
                </div>
            </BCard>

            <ul class="nav nav-tabs mb-4 nav-justified border-secondary">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'EVENTOS', 'text-white': abaAtiva !== 'EVENTOS' }" href="#" @click.prevent="abaAtiva = 'EVENTOS'">
                        📝 Súmula
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'TIMELINE', 'text-white': abaAtiva !== 'TIMELINE' }" href="#" @click.prevent="abaAtiva = 'TIMELINE'">
                        ⏱️ Lances
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'ESCALACAO', 'text-white': abaAtiva !== 'ESCALACAO' }" href="#" @click.prevent="abaAtiva = 'ESCALACAO'">
                        📋 Escalação
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'SUBS', 'text-white': abaAtiva !== 'SUBS' }" href="#" @click.prevent="abaAtiva = 'SUBS'">
                        🔄 Subs
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'UNIFORMES', 'text-white': abaAtiva !== 'UNIFORMES' }" href="#" @click.prevent="abaAtiva = 'UNIFORMES'">
                        👕 Uniformes
                    </a>
                </li>
            </ul>

            <div v-if="abaAtiva === 'UNIFORMES'">
                <BRow>
                    <BCol md="6" class="mb-4">
                        <BCard :title="`Uniforme: ${jogo.timeA.nome}`" class="h-100 bg-dark text-white border-secondary">
                            <div v-if="!timeFullA.cores || timeFullA.cores.length === 0" class="text-muted small">
                                Nenhuma cor cadastrada para este time. <br>
                                <a href="#" class="text-info" @click.prevent="$router.push(`/editar-clube/${jogo.timeA.id}`)">Clique aqui para editar o clube.</a>
                            </div>
                            <div v-else class="d-flex flex-wrap gap-3">
                                <div v-for="(cor, idx) in timeFullA.cores" :key="idx" 
                                     class="color-option p-2 border border-secondary rounded cursor-pointer"
                                     :class="{ 'border-primary bg-secondary shadow-sm': isUniformeSelecionado(cor, 'A') }"
                                     @click="selecionarUniforme(cor, 'A')">
                                    <div class="color-badge mx-auto" 
                                         :style="{ backgroundColor: cor.interno, borderColor: cor.externo }">
                                    </div>
                                    <div class="text-center small mt-1">Opção {{ idx + 1 }}</div>
                                </div>
                            </div>
                        </BCard>
                    </BCol>

                    <BCol md="6" class="mb-4">
                        <BCard :title="`Uniforme: ${jogo.timeB.nome}`" class="h-100 bg-dark text-white border-secondary">
                            <div v-if="!timeFullB.cores || timeFullB.cores.length === 0" class="text-muted small">
                                Nenhuma cor cadastrada para este time. <br>
                                <a href="#" class="text-info" @click.prevent="$router.push(`/editar-clube/${jogo.timeB.id}`)">Clique aqui para editar o clube.</a>
                            </div>
                            <div v-else class="d-flex flex-wrap gap-3">
                                <div v-for="(cor, idx) in timeFullB.cores" :key="idx" 
                                     class="color-option p-2 border border-secondary rounded cursor-pointer"
                                     :class="{ 'border-primary bg-secondary shadow-sm': isUniformeSelecionado(cor, 'B') }"
                                     @click="selecionarUniforme(cor, 'B')">
                                    <div class="color-badge mx-auto" 
                                         :style="{ backgroundColor: cor.interno, borderColor: cor.externo }">
                                    </div>
                                    <div class="text-center small mt-1">Opção {{ idx + 1 }}</div>
                                </div>
                            </div>
                        </BCard>
                    </BCol>
                </BRow>
            </div>

            <div v-else-if="abaAtiva === 'TIMELINE'">
                <BCard title="Histórico da Partida" class="shadow-sm bg-dark text-white border-secondary">
                    <div v-if="timeline.length === 0" class="text-center text-muted py-4">
                        Nenhum evento registrado ainda.
                    </div>
                    <div v-else class="timeline-container">
                        <div v-for="(evento, index) in timeline" :key="evento.id" class="d-flex align-items-center mb-3 border-bottom border-secondary pb-2">
                            
                            <div class="me-3 text-center" style="width: 40px;">
                                <div class="fs-4">{{ getIconeEvento(evento) }}</div>
                                <small class="text-muted" style="font-size: 0.7rem;">{{ index + 1 }}º</small>
                            </div>

                            <div class="flex-grow-1">
                                <div v-if="evento.tipo !== 'SUBS'">
                                    <strong>{{ getDescricaoEvento(evento.tipo) }}</strong>
                                    <div class="small">
                                        {{ evento.jogador?.nome || 'Desconhecido' }} 
                                        <span class="badge bg-secondary ms-1">#{{ evento.jogador?.numero }}</span>
                                    </div>
                                    <div class="small text-muted">{{ getNomeTime(evento.timeId) }}</div>
                                </div>

                                <div v-else>
                                    <strong>Substituição</strong>
                                    <div class="small text-danger">⬇ Sai: {{ evento.sai?.nome }} (#{{ evento.sai?.numero }})</div>
                                    <div class="small text-success">⬆ Entra: {{ evento.entra?.nome }} (#{{ evento.entra?.numero }})</div>
                                    <div class="small text-muted">{{ getNomeTime(evento.timeId) }}</div>
                                </div>
                            </div>

                            <BButton size="sm" variant="outline-danger" class="ms-2" 
                                     @click="removerItemTimeline(evento)" title="Remover evento">
                                🗑️
                            </BButton>
                        </div>
                    </div>
                </BCard>
            </div>

            <div v-else-if="abaAtiva === 'ESCALACAO'">
                <div class="alert alert-info bg-dark border-info text-info small">
                    Selecione os jogadores que iniciaram a partida.
                </div>
                <BRow>
                    <BCol md="6" class="mb-3">
                        <BCard class="h-100 bg-dark text-white border-secondary">
                            <template #header>
                                <h6 class="mb-0 text-white">{{ jogo.timeA.nome }}</h6>
                            </template>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="small text-muted">Selecionados: {{ jogo.titularesA.length }}</span>
                                <div>
                                    <BButton size="sm" variant="link" class="text-decoration-none text-info" @click="selecionarTodos('A')">Todos</BButton>
                                    <BButton size="sm" variant="link" class="text-decoration-none text-secondary" @click="selecionarNenhum('A')">Nenhum</BButton>
                                </div>
                            </div>
                            <div class="list-group">
                                <div v-for="jogador in elencoA" :key="getId(jogador)" class="list-group-item list-group-item-action list-group-item-dark d-flex align-items-center border-secondary">
                                    <input class="form-check-input me-3 bg-dark border-secondary" type="checkbox" :checked="ehTitular(jogador, jogo.titularesA)" @change="toggleTitular(jogador, 'A')" style="cursor: pointer;">
                                    <span class="badge bg-secondary me-2">{{ jogador.numero }}</span>
                                    {{ jogador.nome }}
                                </div>
                            </div>
                        </BCard>
                    </BCol>
                    <BCol md="6" class="mb-3">
                        <BCard class="h-100 bg-dark text-white border-secondary">
                            <template #header>
                                <h6 class="mb-0 text-white">{{ jogo.timeB.nome }}</h6>
                            </template>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="small text-muted">Selecionados: {{ jogo.titularesB.length }}</span>
                                <div>
                                    <BButton size="sm" variant="link" class="text-decoration-none text-info" @click="selecionarTodos('B')">Todos</BButton>
                                    <BButton size="sm" variant="link" class="text-decoration-none text-secondary" @click="selecionarNenhum('B')">Nenhum</BButton>
                                </div>
                            </div>
                            <div class="list-group">
                                <div v-for="jogador in elencoB" :key="getId(jogador)" class="list-group-item list-group-item-action list-group-item-dark d-flex align-items-center border-secondary">
                                    <input class="form-check-input me-3 bg-dark border-secondary" type="checkbox" :checked="ehTitular(jogador, jogo.titularesB)" @change="toggleTitular(jogador, 'B')" style="cursor: pointer;">
                                    <span class="badge bg-secondary me-2">{{ jogador.numero }}</span>
                                    {{ jogador.nome }}
                                </div>
                            </div>
                        </BCard>
                    </BCol>
                </BRow>
            </div>

            <div v-else-if="abaAtiva === 'SUBS'">
                <BRow>
                    <BCol md="6" class="mb-4">
                        <BCard :title="`Substituição - ${jogo.timeA.nome}`" class="h-100 bg-dark text-white border-secondary">
                            <BFormGroup label="Sai (Em campo):" class="mb-2 text-white-50">
                                <BFormSelect v-model="subTempA.saiId" class="bg-secondary text-white border-secondary">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresEmCampo(elencoA, jogo.titularesA, jogo.timeA.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BFormGroup label="Entra (Banco):" class="mb-3 text-white-50">
                                <BFormSelect v-model="subTempA.entraId" class="bg-secondary text-white border-secondary">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresNoBanco(elencoA, jogo.titularesA, jogo.timeA.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BButton variant="success" class="w-100" @click="realizarSubstituicao('A')" :disabled="!subTempA.saiId || !subTempA.entraId">
                                🔄 Confirmar Substituição
                            </BButton>
                        </BCard>
                    </BCol>

                    <BCol md="6" class="mb-4">
                        <BCard :title="`Substituição - ${jogo.timeB.nome}`" class="h-100 bg-dark text-white border-secondary">
                            <BFormGroup label="Sai (Em campo):" class="mb-2 text-white-50">
                                <BFormSelect v-model="subTempB.saiId" class="bg-secondary text-white border-secondary">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresEmCampo(elencoB, jogo.titularesB, jogo.timeB.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BFormGroup label="Entra (Banco):" class="mb-3 text-white-50">
                                <BFormSelect v-model="subTempB.entraId" class="bg-secondary text-white border-secondary">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresNoBanco(elencoB, jogo.titularesB, jogo.timeB.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BButton variant="success" class="w-100" @click="realizarSubstituicao('B')" :disabled="!subTempB.saiId || !subTempB.entraId">
                                🔄 Confirmar Substituição
                            </BButton>
                        </BCard>
                    </BCol>
                </BRow>
            </div>

            <div v-else>
                <div class="sticky-top bg-dark border-bottom border-secondary py-3 mb-4" style="z-index: 10;">
                    <p class="text-center text-muted small mb-2">
                        <span v-if="!ferramentaAtiva">Selecione uma ação e clique no jogador.</span>
                        <span v-else class="text-primary fw-bold">Modo Ativo: APLICAR {{ ferramentaAtiva }}</span>
                    </p>

                    <div class="d-flex justify-content-center gap-2">
                        <BButton :variant="ferramentaAtiva === 'GOL' ? 'success' : 'outline-success'" @click="alternarFerramenta('GOL')">⚽ Gol</BButton>
                        <BButton :variant="ferramentaAtiva === 'AMARELO' ? 'warning' : 'outline-warning'" @click="alternarFerramenta('AMARELO')">🟨 Amarelo</BButton>
                        <BButton :variant="ferramentaAtiva === 'VERMELHO' ? 'danger' : 'outline-danger'" @click="alternarFerramenta('VERMELHO')">🟥 Vermelho</BButton>
                        <BButton :variant="ferramentaAtiva === 'CRAQUE' ? 'primary' : 'outline-primary'" @click="alternarFerramenta('CRAQUE')">⭐ Craque</BButton>
                    </div>
                </div>

                <BRow>
                    <BCol md="6" class="mb-4">
                        <h6 class="text-center border-bottom border-secondary pb-2 text-white">{{ jogo.timeA.nome }}</h6>
                        <div class="list-group">
                            <button v-for="jogador in elencoA" :key="getId(jogador)"
                                class="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-center border-secondary"
                                :class="getClasseJogador(jogador, jogo.timeA.id)"
                                @click="aplicarAcao(jogador, jogo.timeA.id)" style="cursor: pointer;">
                                
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-2" style="width: 30px;">{{ jogador.numero }}</span>
                                    <span class="me-2">{{ jogador.nome }}</span>
                                    <span v-if="ehTitular(jogador, jogo.titularesA)" class="badge text-info border border-info me-1" title="Titular">T</span>
                                    <span v-if="entrouNoJogo(jogador, jogo.timeA.id)" class="text-success me-1" title="Entrou">⬆</span>
                                    <span v-if="saiuDoJogo(jogador, jogo.timeA.id)" class="text-danger me-1" title="Saiu">⬇</span>
                                    <span v-if="ehCraque(jogador, jogo.timeA.id)" title="Craque">⭐</span>
                                </div>

                                <div class="d-flex gap-1 event-icons">
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeA.id, 'GOL')" :key="ev.id">⚽</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeA.id, 'AMARELO')" :key="ev.id">🟨</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeA.id, 'VERMELHO')" :key="ev.id">🟥</span>
                                </div>
                            </button>
                        </div>
                    </BCol>

                    <BCol md="6" class="mb-4">
                        <h6 class="text-center border-bottom border-secondary pb-2 text-white">{{ jogo.timeB.nome }}</h6>
                        <div class="list-group">
                            <button v-for="jogador in elencoB" :key="getId(jogador)"
                                class="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-center border-secondary"
                                :class="getClasseJogador(jogador, jogo.timeB.id)"
                                @click="aplicarAcao(jogador, jogo.timeB.id)" style="cursor: pointer;">
                                
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-2" style="width: 30px;">{{ jogador.numero }}</span>
                                    <span class="me-2">{{ jogador.nome }}</span>
                                    <span v-if="ehTitular(jogador, jogo.titularesB)" class="badge text-info border border-info me-1" title="Titular">T</span>
                                    <span v-if="entrouNoJogo(jogador, jogo.timeB.id)" class="text-success me-1" title="Entrou">⬆</span>
                                    <span v-if="saiuDoJogo(jogador, jogo.timeB.id)" class="text-danger me-1" title="Saiu">⬇</span>
                                    <span v-if="ehCraque(jogador, jogo.timeB.id)" title="Craque">⭐</span>
                                </div>

                                <div class="d-flex gap-1 event-icons">
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeB.id, 'GOL')" :key="ev.id">⚽</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeB.id, 'AMARELO')" :key="ev.id">🟨</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeB.id, 'VERMELHO')" :key="ev.id">🟥</span>
                                </div>
                            </button>
                        </div>
                    </BCol>
                </BRow>
            </div>

        </div>
    </div>
</template>

<script>
import DbService from '../services/DbService.js';
import { BSpinner, BButton, BAlert, BCard, BRow, BCol, BFormInput, BFormGroup, BFormSelect } from 'bootstrap-vue-next';

export default {
    name: 'SumulaJogo',
    components: { BSpinner, BButton, BAlert, BCard, BRow, BCol, BFormInput, BFormGroup, BFormSelect },
    data() {
        return {
            carregando: true,
            abaAtiva: 'EVENTOS',
            jogo: null,
            timeFullA: {}, 
            timeFullB: {},
            elencoA: [],
            elencoB: [],
            ferramentaAtiva: null,
            idCampeonato: '',
            idJogo: '',
            subTempA: { saiId: null, entraId: null },
            subTempB: { saiId: null, entraId: null }
        }
    },
    computed: {
        golsA() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeA.id).length;
        },
        golsB() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeB.id).length;
        },
        timeline() {
            if (!this.jogo) return [];
            const eventos = (this.jogo.eventos || []).map(e => ({ ...e, categoria: 'EVENTO' }));
            const subs = (this.jogo.substituicoes || []).map(s => ({ ...s, tipo: 'SUBS', categoria: 'SUBS' }));
            const listaCompleta = [...eventos, ...subs];
            return listaCompleta.sort((a, b) => a.id - b.id);
        }
    },
    async mounted() {
        this.idCampeonato = this.$route.params.idCampeonato;
        this.idJogo = this.$route.params.idJogo;
        await this.carregarDados();
    },
    methods: {
        async carregarDados() {
            this.carregando = true;
            try {
                const camp = await DbService.getCampeonatoById(this.idCampeonato);
                if (!camp) throw new Error("Campeonato não encontrado");

                const jogoEncontrado = camp.jogos.find(j => String(j.id) === String(this.idJogo));
                if (!jogoEncontrado) throw new Error("Jogo não encontrado");

                if (!jogoEncontrado.eventos) jogoEncontrado.eventos = [];
                if (!jogoEncontrado.substituicoes) jogoEncontrado.substituicoes = [];
                if (!jogoEncontrado.titularesA) jogoEncontrado.titularesA = [];
                if (!jogoEncontrado.titularesB) jogoEncontrado.titularesB = [];
                if (!jogoEncontrado.dataHora) jogoEncontrado.dataHora = '';
                if (!jogoEncontrado.craque) jogoEncontrado.craque = null; 
                if (!jogoEncontrado.uniformeA) jogoEncontrado.uniformeA = null;
                if (!jogoEncontrado.uniformeB) jogoEncontrado.uniformeB = null;

                const timeGlobalA = await DbService.getTimeById(jogoEncontrado.timeA.id);
                const timeGlobalB = await DbService.getTimeById(jogoEncontrado.timeB.id);

                const snapshotA = camp.timesParticipantes.find(t => t.id === jogoEncontrado.timeA.id) || {};
                const snapshotB = camp.timesParticipantes.find(t => t.id === jogoEncontrado.timeB.id) || {};

                this.timeFullA = timeGlobalA || snapshotA;
                this.timeFullB = timeGlobalB || snapshotB;

                this.elencoA = this.timeFullA.jogadores || [];
                this.elencoB = this.timeFullB.jogadores || [];

                // REMOVIDO: Lógica de selecionar todos automaticamente. Agora começa vazio por padrão.

                this.jogo = jogoEncontrado;

            } catch (error) {
                console.error(error);
                alert("Erro ao carregar dados.");
            } finally {
                this.carregando = false;
            }
        },

        getId(jogador) {
            return jogador.id || jogador.numero;
        },

        criarSnapshot(jogador) {
            return {
                id: this.getId(jogador),
                numero: jogador.numero,
                nome: jogador.nome
            };
        },

        // --- UNIFORMES ---
        isUniformeSelecionado(cor, lado) {
            const atual = lado === 'A' ? this.jogo.uniformeA : this.jogo.uniformeB;
            if (!atual) return false;
            return atual.interno === cor.interno && atual.externo === cor.externo;
        },
        selecionarUniforme(cor, lado) {
            if (lado === 'A') this.jogo.uniformeA = cor;
            else this.jogo.uniformeB = cor;
            this.salvarAlteracoes();
        },

        // --- TIMELINE ---
        getIconeEvento(evento) {
            switch(evento.tipo) {
                case 'GOL': return '⚽';
                case 'AMARELO': return '🟨';
                case 'VERMELHO': return '🟥';
                case 'CRAQUE': return '⭐';
                case 'SUBS': return '🔄';
                default: return '•';
            }
        },
        getDescricaoEvento(tipo) {
            switch(tipo) {
                case 'GOL': return 'Gol Marcado';
                case 'AMARELO': return 'Cartão Amarelo';
                case 'VERMELHO': return 'Cartão Vermelho';
                case 'CRAQUE': return 'Eleito Craque do Jogo';
                default: return tipo;
            }
        },
        getNomeTime(timeId) {
            if (timeId === this.jogo.timeA.id) return this.jogo.timeA.nome;
            if (timeId === this.jogo.timeB.id) return this.jogo.timeB.nome;
            return '';
        },
        async removerItemTimeline(item) {
            if(!confirm("Remover este item do histórico?")) return;
            
            if (item.categoria === 'SUBS') {
                this.jogo.substituicoes = this.jogo.substituicoes.filter(s => s.id !== item.id);
            } else {
                this.jogo.eventos = this.jogo.eventos.filter(e => e.id !== item.id);
                if (item.tipo === 'CRAQUE') {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                }
            }
            await this.salvarAlteracoes();
        },

        // --- AÇÕES ---
        alternarFerramenta(ferramenta) {
            this.ferramentaAtiva = (this.ferramentaAtiva === ferramenta) ? null : ferramenta;
        },

        async aplicarAcao(jogador, timeId) {
            if (!this.ferramentaAtiva) return;
            const snapshot = this.criarSnapshot(jogador);

            if (this.ferramentaAtiva === 'CRAQUE') {
                if (this.jogo.craque && this.jogo.craque.id == snapshot.id && this.jogo.craqueTimeId == timeId) {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                } else {
                    this.jogo.craque = snapshot;
                    this.jogo.craqueTimeId = timeId;
                }
            } else {
                if (this.ferramentaAtiva === 'VERMELHO' && this.temCartao(jogador, timeId, 'VERMELHO')) return alert("Já tem vermelho.");
                if (this.ferramentaAtiva === 'AMARELO' && this.temCartao(jogador, timeId, 'AMARELO')) return alert("Já tem amarelo.");

                this.jogo.eventos.push({
                    id: Date.now(),
                    tipo: this.ferramentaAtiva,
                    jogador: snapshot,
                    jogadorId: snapshot.id, 
                    timeId: timeId,
                    minuto: null
                });
            }
            await this.salvarAlteracoes();
        },

        async removerEvento(evento) {
            this.removerItemTimeline(evento);
        },

        // --- ESCALAÇÃO ---
        toggleTitular(jogador, lado) {
            const lista = lado === 'A' ? this.jogo.titularesA : this.jogo.titularesB;
            const jId = this.getId(jogador);
            const index = lista.findIndex(t => t?.id == jId);

            if (index !== -1) {
                lista.splice(index, 1);
            } else {
                lista.push(this.criarSnapshot(jogador));
            }
            this.salvarAlteracoes();
        },

        selecionarTodos(lado) {
            if (lado === 'A') this.jogo.titularesA = this.elencoA.map(j => this.criarSnapshot(j));
            else this.jogo.titularesB = this.elencoB.map(j => this.criarSnapshot(j));
            this.salvarAlteracoes();
        },

        selecionarNenhum(lado) {
            if (lado === 'A') this.jogo.titularesA = [];
            else this.jogo.titularesB = [];
            this.salvarAlteracoes();
        },

        async realizarSubstituicao(lado) {
            const temp = lado === 'A' ? this.subTempA : this.subTempB;
            const timeId = lado === 'A' ? this.jogo.timeA.id : this.jogo.timeB.id;
            const elenco = lado === 'A' ? this.elencoA : this.elencoB;

            const jogadorSai = elenco.find(j => this.getId(j) == temp.saiId);
            const jogadorEntra = elenco.find(j => this.getId(j) == temp.entraId);

            if (!jogadorSai || !jogadorEntra) return alert("Erro ao identificar jogadores.");

            this.jogo.substituicoes.push({
                id: Date.now(),
                timeId: timeId,
                sai: this.criarSnapshot(jogadorSai),
                entra: this.criarSnapshot(jogadorEntra),
                minuto: null
            });

            temp.saiId = null;
            temp.entraId = null;
            await this.salvarAlteracoes();
        },

        async removerSubstituicao(sub) {
            this.removerItemTimeline(sub);
        },

        // --- HELPERS ---
        getSubstituicoesDoTime(timeId) {
            return (this.jogo.substituicoes || []).filter(s => s.timeId === timeId);
        },
        getJogadoresEmCampo(elenco, listaTitulares, timeId) {
            const idsTitulares = (listaTitulares || []).map(t => t?.id).filter(id => id);
            const subs = this.getSubstituicoesDoTime(timeId);
            const idsSairam = subs.map(s => s.sai?.id).filter(id => id);
            const idsEntraram = subs.map(s => s.entra?.id).filter(id => id);
            const idsEmCampo = [
                ...idsTitulares.filter(id => !idsSairam.includes(id)), 
                ...idsEntraram.filter(id => !idsSairam.includes(id))
            ];
            return elenco.filter(j => idsEmCampo.includes(this.getId(j)));
        },
        getJogadoresNoBanco(elenco, listaTitulares, timeId) {
            const idsTitulares = (listaTitulares || []).map(t => t?.id).filter(id => id);
            const subs = this.getSubstituicoesDoTime(timeId);
            const idsEntraram = subs.map(s => s.entra?.id).filter(id => id);
            const idsEmCampoOuSairam = [...idsTitulares, ...idsEntraram];
            return elenco.filter(j => !idsEmCampoOuSairam.includes(this.getId(j)));
        },
        ehCraque(jogador, timeId) {
            if (!this.jogo.craque) return false;
            const jId = this.getId(jogador);
            return this.jogo.craque.id == jId && this.jogo.craqueTimeId == timeId;
        },
        getEventosJogador(jogador, timeId, tipo) {
            const jId = this.getId(jogador);
            return this.jogo.eventos.filter(e => e.jogador && e.jogador.id == jId && e.timeId == timeId && e.tipo === tipo);
        },
        temCartao(jogador, timeId, tipo) {
            return this.getEventosJogador(jogador, timeId, tipo).length > 0;
        },
        ehTitular(jogador, listaTitulares) {
            const jId = this.getId(jogador);
            return (listaTitulares || []).some(t => t?.id == jId);
        },
        entrouNoJogo(jogador, timeId) {
            const jId = this.getId(jogador);
            return this.getSubstituicoesDoTime(timeId).some(s => s.entra?.id == jId);
        },
        saiuDoJogo(jogador, timeId) {
            const jId = this.getId(jogador);
            return this.getSubstituicoesDoTime(timeId).some(s => s.sai?.id == jId);
        },
        getClasseJogador(jogador, timeId) {
            const jId = this.getId(jogador);
            if (this.temCartao(jogador, timeId, 'VERMELHO')) return 'list-group-item-danger';
            const titulares = (timeId === this.jogo.timeA.id) ? this.jogo.titularesA : this.jogo.titularesB;
            const subs = this.getSubstituicoesDoTime(timeId);
            const saiu = subs.some(s => s.sai?.id == jId);
            const entrou = subs.some(s => s.entra?.id == jId);
            const titular = (titulares || []).some(t => t?.id == jId);
            if ((titular && !saiu) || (entrou && !saiu)) return 'border-start border-1 border-info'; // Em campo (verde neon ou azul neon)
            else if (saiu) return 'text-muted bg-black opacity-50'; // Saiu (mais escuro)
            else return '';
        },

        async salvarAlteracoes() {
            this.jogo.golsA = this.golsA;
            this.jogo.golsB = this.golsB;
            this.jogo.finalizado = true;
            try {
                await DbService.atualizarJogo(this.idCampeonato, JSON.parse(JSON.stringify(this.jogo)));
            } catch (error) {
                console.error("Erro ao salvar", error);
            }
        },
        voltar() {
            this.$router.push(`/campeonato/${this.idCampeonato}`);
        }
    }
}
</script>

<style scoped>
.color-badge {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-style: solid;
  border-width: 8px;
}
.uniforme-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border-style: solid;
  border-width: 3px;
  position: absolute;
  bottom: -10px;
  right: -10px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.event-icons span {
    cursor: pointer;
    transition: transform 0.2s;
}
.event-icons span:hover {
    transform: scale(1.3);
}
.cursor-pointer { cursor: pointer; }
.nav-link { cursor: pointer; font-size:0.7rem }

.list-group-item{
    background-color: transparent;
}
.list-group-item-action:not(.active):hover, .list-group-item-action:not(.active):focus{
    background-color: rgb(19, 4, 73);
    color:#FFF;
}
[title="Entrou"], [title="Saiu"]{
    font-size: 1.5rem;
}
</style>