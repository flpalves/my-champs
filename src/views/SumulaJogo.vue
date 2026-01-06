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

            <BCard class="text-center shadow-sm mb-4 border-0">
                <div class="d-flex justify-content-center align-items-center mb-3">
                    <div class="text-center mx-3" style="width: 100px;">
                        <img :src="jogo.timeA.escudo" style="height: 50px;" class="mb-1 d-block mx-auto" />
                        <small class="fw-bold text-truncate d-block">{{ jogo.timeA.nome }}</small>
                    </div>

                    <div class="d-flex align-items-center px-3 py-2 rounded shadow-sm border">
                        <h1 class="m-0 fw-bold">{{ golsA }}</h1>
                        <span class="mx-2 text-muted">x</span>
                        <h1 class="m-0 fw-bold">{{ golsB }}</h1>
                    </div>

                    <div class="text-center mx-3" style="width: 100px;">
                        <img :src="jogo.timeB.escudo" style="height: 50px;" class="mb-1 d-block mx-auto" />
                        <small class="fw-bold text-truncate d-block">{{ jogo.timeB.nome }}</small>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <BFormGroup label="Data do Jogo:" label-cols="auto" class="mb-0">
                        <BFormInput type="datetime-local" v-model="jogo.dataHora" size="sm" @change="salvarAlteracoes" />
                    </BFormGroup>
                </div>
            </BCard>

            <ul class="nav nav-tabs mb-4">
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'EVENTOS' }" href="#" @click.prevent="abaAtiva = 'EVENTOS'">
                        📝 Súmula (Lances)
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'ESCALACAO' }" href="#" @click.prevent="abaAtiva = 'ESCALACAO'">
                        📋 Escalação Inicial
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" :class="{ active: abaAtiva === 'SUBS' }" href="#" @click.prevent="abaAtiva = 'SUBS'">
                        🔄 Substituições
                    </a>
                </li>
            </ul>

            <div v-if="abaAtiva === 'ESCALACAO'">
                <div class="alert alert-info small">
                    Selecione os jogadores que iniciaram a partida. O número de titulares é livre.
                </div>
                <BRow>
                    <BCol md="6" class="mb-3">
                        <BCard :title="jogo.timeA.nome" class="h-100">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="small text-muted">Selecionados: {{ jogo.titularesA.length }}</span>
                                <BButton size="sm" variant="link" @click="selecionarTodos('A')">Todos</BButton>
                            </div>
                            <div class="list-group">
                                <div v-for="jogador in elencoA" :key="getId(jogador)" 
                                     class="list-group-item d-flex align-items-center">
                                    <input class="form-check-input me-3" type="checkbox" 
                                           :checked="ehTitular(jogador, jogo.titularesA)"
                                           @change="toggleTitular(jogador, 'A')" 
                                           style="cursor: pointer;">
                                    <span class="badge bg-secondary me-2">{{ jogador.numero }}</span>
                                    {{ jogador.nome }}
                                </div>
                            </div>
                        </BCard>
                    </BCol>
                    <BCol md="6" class="mb-3">
                        <BCard :title="jogo.timeB.nome" class="h-100">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="small text-muted">Selecionados: {{ jogo.titularesB.length }}</span>
                                <BButton size="sm" variant="link" @click="selecionarTodos('B')">Todos</BButton>
                            </div>
                            <div class="list-group">
                                <div v-for="jogador in elencoB" :key="getId(jogador)" 
                                     class="list-group-item d-flex align-items-center">
                                    <input class="form-check-input me-3" type="checkbox" 
                                           :checked="ehTitular(jogador, jogo.titularesB)"
                                           @change="toggleTitular(jogador, 'B')" 
                                           style="cursor: pointer;">
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
                        <BCard :title="`Substituição - ${jogo.timeA.nome}`" class="h-100">
                            <BFormGroup label="Sai (Em campo):" class="mb-2">
                                <BFormSelect v-model="subTempA.saiId">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresEmCampo(elencoA, jogo.titularesA, jogo.timeA.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BFormGroup label="Entra (Banco):" class="mb-3">
                                <BFormSelect v-model="subTempA.entraId">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresNoBanco(elencoA, jogo.titularesA, jogo.timeA.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BButton variant="success" class="w-100" @click="realizarSubstituicao('A')" :disabled="!subTempA.saiId || !subTempA.entraId">
                                🔄 Confirmar Substituição
                            </BButton>

                            <hr v-if="getSubstituicoesDoTime(jogo.timeA.id).length > 0">
                            <ul class="list-unstyled small mb-0">
                                <li v-for="(sub, idx) in getSubstituicoesDoTime(jogo.timeA.id)" :key="idx" class="d-flex justify-content-between border-bottom py-1">
                                    <span class="text-danger">⬇ {{ sub.sai.nome }} (#{{ sub.sai.numero }})</span>
                                    <span class="text-success">⬆ {{ sub.entra.nome }} (#{{ sub.entra.numero }})</span>
                                    <span class="text-muted cursor-pointer" @click="removerSubstituicao(sub)">❌</span>
                                </li>
                            </ul>
                        </BCard>
                    </BCol>

                    <BCol md="6" class="mb-4">
                        <BCard :title="`Substituição - ${jogo.timeB.nome}`" class="h-100">
                            <BFormGroup label="Sai (Em campo):" class="mb-2">
                                <BFormSelect v-model="subTempB.saiId">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresEmCampo(elencoB, jogo.titularesB, jogo.timeB.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BFormGroup label="Entra (Banco):" class="mb-3">
                                <BFormSelect v-model="subTempB.entraId">
                                    <option :value="null">Selecione...</option>
                                    <option v-for="j in getJogadoresNoBanco(elencoB, jogo.titularesB, jogo.timeB.id)" :key="getId(j)" :value="getId(j)">
                                        #{{ j.numero }} - {{ j.nome }}
                                    </option>
                                </BFormSelect>
                            </BFormGroup>
                            <BButton variant="success" class="w-100" @click="realizarSubstituicao('B')" :disabled="!subTempB.saiId || !subTempB.entraId">
                                🔄 Confirmar Substituição
                            </BButton>

                            <hr v-if="getSubstituicoesDoTime(jogo.timeB.id).length > 0">
                            <ul class="list-unstyled small mb-0">
                                <li v-for="(sub, idx) in getSubstituicoesDoTime(jogo.timeB.id)" :key="idx" class="d-flex justify-content-between border-bottom py-1">
                                    <span class="text-danger">⬇ {{ sub.sai.nome }} (#{{ sub.sai.numero }})</span>
                                    <span class="text-success">⬆ {{ sub.entra.nome }} (#{{ sub.entra.numero }})</span>
                                    <span class="text-muted cursor-pointer" @click="removerSubstituicao(sub)">❌</span>
                                </li>
                            </ul>
                        </BCard>
                    </BCol>
                </BRow>
            </div>

            <div v-else>
                <div class="sticky-top py-3 border-bottom mb-4" style="z-index: 10;">
                    <p class="text-center text-muted small mb-2">
                        <span v-if="!ferramentaAtiva">Selecione uma ação e clique no jogador. 
                            <span class="text-danger">Clique no ícone para remover.</span>
                        </span>
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
                        <h6 class="text-center border-bottom pb-2">{{ jogo.timeA.nome }}</h6>
                        <div class="list-group">
                            <button v-for="jogador in elencoA" :key="getId(jogador)"
                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                :class="getClasseJogador(jogador, jogo.timeA.id)"
                                @click="aplicarAcao(jogador, jogo.timeA.id)" style="cursor: pointer;">
                                
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-2" style="width: 30px;">{{ jogador.numero }}</span>
                                    <span class="me-2">{{ jogador.nome }}</span>
                                    <span v-if="ehTitular(jogador, jogo.titularesA)" class="badge bg-light text-dark border me-1" title="Titular">T</span>
                                    <span v-if="entrouNoJogo(jogador, jogo.timeA.id)" class="text-success me-1" title="Entrou">⬆</span>
                                    <span v-if="saiuDoJogo(jogador, jogo.timeA.id)" class="text-danger me-1" title="Saiu">⬇</span>
                                    <span v-if="ehCraque(jogador, jogo.timeA.id)" title="Craque">⭐</span>
                                </div>

                                <div class="d-flex gap-1 event-icons">
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeA.id, 'GOL')" :key="ev.id" @click.stop="removerEvento(ev)">⚽</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeA.id, 'AMARELO')" :key="ev.id" @click.stop="removerEvento(ev)">🟨</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeA.id, 'VERMELHO')" :key="ev.id" @click.stop="removerEvento(ev)">🟥</span>
                                </div>
                            </button>
                        </div>
                    </BCol>

                    <BCol md="6" class="mb-4">
                        <h6 class="text-center border-bottom pb-2">{{ jogo.timeB.nome }}</h6>
                        <div class="list-group">
                            <button v-for="jogador in elencoB" :key="getId(jogador)"
                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                                :class="getClasseJogador(jogador, jogo.timeB.id)"
                                @click="aplicarAcao(jogador, jogo.timeB.id)" style="cursor: pointer;">
                                
                                <div class="d-flex align-items-center">
                                    <span class="badge bg-secondary me-2" style="width: 30px;">{{ jogador.numero }}</span>
                                    <span class="me-2">{{ jogador.nome }}</span>
                                    <span v-if="ehTitular(jogador, jogo.titularesB)" class="badge bg-light text-dark border me-1" title="Titular">T</span>
                                    <span v-if="entrouNoJogo(jogador, jogo.timeB.id)" class="text-success me-1" title="Entrou">⬆</span>
                                    <span v-if="saiuDoJogo(jogador, jogo.timeB.id)" class="text-danger me-1" title="Saiu">⬇</span>
                                    <span v-if="ehCraque(jogador, jogo.timeB.id)" title="Craque">⭐</span>
                                </div>

                                <div class="d-flex gap-1 event-icons">
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeB.id, 'GOL')" :key="ev.id" @click.stop="removerEvento(ev)">⚽</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeB.id, 'AMARELO')" :key="ev.id" @click.stop="removerEvento(ev)">🟨</span>
                                    <span v-for="ev in getEventosJogador(jogador, jogo.timeB.id, 'VERMELHO')" :key="ev.id" @click.stop="removerEvento(ev)">🟥</span>
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
            // Contagem baseada no ID do time do evento
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeA.id).length;
        },
        golsB() {
            if (!this.jogo?.eventos) return 0;
            return this.jogo.eventos.filter(e => e.tipo === 'GOL' && e.timeId === this.jogo.timeB.id).length;
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

                // Inicializações de segurança
                if (!jogoEncontrado.eventos) jogoEncontrado.eventos = [];
                if (!jogoEncontrado.substituicoes) jogoEncontrado.substituicoes = [];
                
                // Arrays de titulares armazenam objetos snapshot: { id, numero, nome }
                if (!jogoEncontrado.titularesA) jogoEncontrado.titularesA = [];
                if (!jogoEncontrado.titularesB) jogoEncontrado.titularesB = [];
                
                if (!jogoEncontrado.dataHora) jogoEncontrado.dataHora = '';
                // Objeto snapshot do craque
                if (!jogoEncontrado.craque) jogoEncontrado.craque = null; 

                const timeFullA = camp.timesParticipantes.find(t => t.id === jogoEncontrado.timeA.id);
                const timeFullB = camp.timesParticipantes.find(t => t.id === jogoEncontrado.timeB.id);

                this.elencoA = timeFullA ? timeFullA.jogadores : [];
                this.elencoB = timeFullB ? timeFullB.jogadores : [];

                // Se não houver titulares definidos (primeira abertura), sugerimos todos por padrão
                if (jogoEncontrado.titularesA.length === 0) {
                    jogoEncontrado.titularesA = this.elencoA.map(j => this.criarSnapshot(j));
                }
                if (jogoEncontrado.titularesB.length === 0) {
                    jogoEncontrado.titularesB = this.elencoB.map(j => this.criarSnapshot(j));
                }

                this.jogo = jogoEncontrado;

            } catch (error) {
                console.error(error);
                alert("Erro ao carregar dados.");
            } finally {
                this.carregando = false;
            }
        },

        // Helper para gerar o ID unificado
        getId(jogador) {
            return jogador.id || jogador.numero;
        },

        // Helper para criar o objeto histórico (snapshot)
        criarSnapshot(jogador) {
            return {
                id: this.getId(jogador),
                numero: jogador.numero,
                nome: jogador.nome
            };
        },

        alternarFerramenta(ferramenta) {
            this.ferramentaAtiva = (this.ferramentaAtiva === ferramenta) ? null : ferramenta;
        },

        async aplicarAcao(jogador, timeId) {
            if (!this.ferramentaAtiva) return;
            
            const snapshot = this.criarSnapshot(jogador);

            if (this.ferramentaAtiva === 'CRAQUE') {
                // Se clicar no mesmo jogador do mesmo time, desmarca
                if (this.jogo.craque && this.jogo.craque.id == snapshot.id && this.jogo.craqueTimeId == timeId) {
                    this.jogo.craque = null;
                    this.jogo.craqueTimeId = null;
                } else {
                    // Salva objeto completo do craque
                    this.jogo.craque = snapshot;
                    this.jogo.craqueTimeId = timeId;
                }
            } else {
                if (this.ferramentaAtiva === 'VERMELHO' && this.temCartao(jogador, timeId, 'VERMELHO')) return alert("Já tem vermelho.");
                if (this.ferramentaAtiva === 'AMARELO' && this.temCartao(jogador, timeId, 'AMARELO')) return alert("Já tem amarelo.");

                this.jogo.eventos.push({
                    id: Date.now(),
                    tipo: this.ferramentaAtiva,
                    // Armazena o objeto do jogador para histórico
                    jogador: snapshot,
                    // Mantemos jogadorId para compatibilidade com buscas rápidas, se necessário
                    jogadorId: snapshot.id, 
                    timeId: timeId,
                    minuto: null
                });
            }
            await this.salvarAlteracoes();
        },

        async removerEvento(evento) {
            if(!confirm(`Remover ${evento.tipo}?`)) return;
            this.jogo.eventos = this.jogo.eventos.filter(e => e.id !== evento.id);
            await this.salvarAlteracoes();
        },

        // --- ESCALAÇÃO ---

        toggleTitular(jogador, lado) {
            const lista = lado === 'A' ? this.jogo.titularesA : this.jogo.titularesB;
            const jId = this.getId(jogador);
            const index = lista.findIndex(t => t.id == jId);

            if (index !== -1) {
                // Remove
                lista.splice(index, 1);
            } else {
                // Adiciona snapshot
                lista.push(this.criarSnapshot(jogador));
            }
            this.salvarAlteracoes();
        },

        selecionarTodos(lado) {
            if (lado === 'A') {
                this.jogo.titularesA = this.elencoA.map(j => this.criarSnapshot(j));
            } else {
                this.jogo.titularesB = this.elencoB.map(j => this.criarSnapshot(j));
            }
            this.salvarAlteracoes();
        },

        // --- SUBSTITUIÇÕES ---

        async realizarSubstituicao(lado) {
            const temp = lado === 'A' ? this.subTempA : this.subTempB;
            const timeId = lado === 'A' ? this.jogo.timeA.id : this.jogo.timeB.id;
            const elenco = lado === 'A' ? this.elencoA : this.elencoB;

            // Busca os objetos completos no elenco atual para criar snapshot
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

            // Limpa form
            temp.saiId = null;
            temp.entraId = null;
            await this.salvarAlteracoes();
        },

        async removerSubstituicao(sub) {
            if(!confirm("Desfazer substituição?")) return;
            this.jogo.substituicoes = this.jogo.substituicoes.filter(s => s.id !== sub.id);
            await this.salvarAlteracoes();
        },

        // --- HELPERS DE FILTRO (Lógica baseada em IDs extraídos dos snapshots) ---

        getSubstituicoesDoTime(timeId) {
            return (this.jogo.substituicoes || []).filter(s => s.timeId === timeId);
        },

        getJogadoresEmCampo(elenco, listaTitulares, timeId) {
            // Extrai IDs dos titulares (que são objetos)
            const idsTitulares = listaTitulares.map(t => t.id);
            const subs = this.getSubstituicoesDoTime(timeId);
            const idsSairam = subs.map(s => s.sai.id);
            const idsEntraram = subs.map(s => s.entra.id);

            // Quem está em campo = (Titulares - Quem Saiu) + Quem Entrou
            const idsEmCampo = [
                ...idsTitulares.filter(id => !idsSairam.includes(id)), 
                ...idsEntraram.filter(id => !idsSairam.includes(id))
            ];
            
            return elenco.filter(j => idsEmCampo.includes(this.getId(j)));
        },

        getJogadoresNoBanco(elenco, listaTitulares, timeId) {
            const idsTitulares = listaTitulares.map(t => t.id);
            const subs = this.getSubstituicoesDoTime(timeId);
            const idsEntraram = subs.map(s => s.entra.id);
            
            // Banco = Todos que não são titulares E não entraram
            const idsEmCampoOuSairam = [...idsTitulares, ...idsEntraram];
            
            return elenco.filter(j => !idsEmCampoOuSairam.includes(this.getId(j)));
        },

        // --- HELPERS VISUAIS / LÓGICA DE ESTADO ---

        ehCraque(jogador, timeId) {
            if (!this.jogo.craque) return false;
            const jId = this.getId(jogador);
            // Compara ID do objeto salvo com ID do jogador da lista
            return this.jogo.craque.id == jId && this.jogo.craqueTimeId == timeId;
        },

        getEventosJogador(jogador, timeId, tipo) {
            const jId = this.getId(jogador);
            // Verifica no objeto 'jogador' dentro do evento
            return this.jogo.eventos.filter(e => 
                e.jogador && e.jogador.id == jId && e.timeId == timeId && e.tipo === tipo
            );
        },

        temCartao(jogador, timeId, tipo) {
            return this.getEventosJogador(jogador, timeId, tipo).length > 0;
        },
        
        ehTitular(jogador, listaTitulares) {
            const jId = this.getId(jogador);
            // Verifica se existe algum objeto na lista com esse ID
            return listaTitulares.some(t => t.id == jId);
        },

        entrouNoJogo(jogador, timeId) {
            const jId = this.getId(jogador);
            return this.getSubstituicoesDoTime(timeId).some(s => s.entra.id == jId);
        },

        saiuDoJogo(jogador, timeId) {
            const jId = this.getId(jogador);
            return this.getSubstituicoesDoTime(timeId).some(s => s.sai.id == jId);
        },
        
        getClasseJogador(jogador, timeId) {
            const jId = this.getId(jogador);
            if (this.temCartao(jogador, timeId, 'VERMELHO')) return 'list-group-item-danger';
            
            const titulares = (timeId === this.jogo.timeA.id) ? this.jogo.titularesA : this.jogo.titularesB;
            const subs = this.getSubstituicoesDoTime(timeId);
            
            const saiu = subs.some(s => s.sai.id == jId);
            const entrou = subs.some(s => s.entra.id == jId);
            const titular = titulares.some(t => t.id == jId);

            if ((titular && !saiu) || (entrou && !saiu)) {
                return 'border-start border-1 border-success'; // Em campo
            } else if (saiu) {
                return 'text-muted bg-light'; // Saiu
            } else {
                return ''; // Banco
            }
        },

        // --- PERSISTÊNCIA ---

        async salvarAlteracoes() {
            this.jogo.golsA = this.golsA;
            this.jogo.golsB = this.golsB;
            this.jogo.finalizado = true;

            try {
                await DbService.atualizarJogo(this.idCampeonato, JSON.parse(JSON.stringify(this.jogo)));
            } catch (error) {
                console.error("Erro ao salvar", error);
                alert("Erro ao salvar.");
            }
        },

        voltar() {
            this.$router.push(`/campeonato/${this.idCampeonato}`);
        }
    }
}
</script>

<style scoped>
.event-icons span {
    cursor: pointer;
    transition: transform 0.2s;
}
.event-icons span:hover {
    transform: scale(1.3);
}
.cursor-pointer { cursor: pointer; }
</style>